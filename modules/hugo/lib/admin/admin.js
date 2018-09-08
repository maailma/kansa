const { InputError } = require('@kansa/errors')
const countVotes = require('./vote-count')

class Admin {
  constructor(pgp, db) {
    this.pgp = pgp
    this.db = db
    this.getAllBallots = this.getAllBallots.bind(this)
    this.getBallots = this.getBallots.bind(this)
    this.getCanon = this.getCanon.bind(this)
    this.getNominations = this.getNominations.bind(this)
    this.classify = this.classify.bind(this)
    this.updateCanonEntry = this.updateCanonEntry.bind(this)
    this.getVoteResults = this.getVoteResults.bind(this)
  }

  getAllBallots(req, res, next) {
    this.db
      .any(
        `
        SELECT DISTINCT ON (category, person_id)
               category, person_id, nominations
          FROM Nominations
      ORDER BY category, person_id, time DESC
    `
      )
      .then(data =>
        res.status(200).json(
          data.reduce((ballots, { category, nominations, person_id }) => {
            const entry = [person_id, nominations]
            if (ballots[category]) {
              ballots[category].push(entry)
            } else {
              ballots[category] = [entry]
            }
            return ballots
          }, {})
        )
      )
      .catch(next)
  }

  getBallots(req, res, next) {
    const category = req.params.category
    if (!category) return next(new InputError('category is required'))
    this.db
      .any(
        `
        SELECT DISTINCT ON (person_id)
               person_id, nominations
          FROM Nominations
         WHERE category = $1
      ORDER BY person_id, time DESC
    `,
        category
      )
      .then(data =>
        res
          .status(200)
          .json(
            data.map(({ nominations, person_id }) => [person_id, nominations])
          )
      )
      .catch(next)
  }

  getCanon(req, res, next) {
    this.db
      .any(
        `
      SELECT id, category, nomination, disqualified, relocated
        FROM Canon`
      )
      .then(data =>
        res.status(200).json(
          data.reduce((canon, entry) => {
            const category = entry.category
            delete entry.category
            if (canon.hasOwnProperty(category)) {
              canon[category].push(entry)
            } else {
              canon[category] = [entry]
            }
            return canon
          }, {})
        )
      )
      .catch(next)
  }

  getNominations(req, res, next) {
    this.db
      .any(
        `
      SELECT DISTINCT ON (category, nomination)
      category, nomination, canon_id
      FROM CurrentNominations
      ORDER BY category, nomination
    `
      )
      .then(data =>
        res.status(200).json(
          data.reduce((nominations, { category, nomination, canon_id }) => {
            const entry = [nomination]
            if (canon_id) entry.push(canon_id)
            if (nominations.hasOwnProperty(category)) {
              nominations[category].push(entry)
            } else {
              nominations[category] = [entry]
            }
            return nominations
          }, {})
        )
      )
      .catch(next)
  }

  _classifyWithObject(category, nomination, getInsertQuery) {
    return this.db.tx(tx =>
      tx
        .one(
          `
        INSERT INTO Canon (category, nomination)
        VALUES ($(category), $(nomination)::jsonb)
        ON CONFLICT (category, nomination)
          DO UPDATE SET category = EXCLUDED.category
        RETURNING id`,
          { category, nomination } // DO UPDATE required for non-empty RETURNING id
        )
        .then(({ id }) => tx.none(getInsertQuery(id)))
    )
  }

  classify(req, res, next) {
    if (!req.body) return next(new InputError('Empty POST body!?'))
    const category = req.body.category
    const nominations = req.body.nominations
    if (!category || !nominations || !nominations.length) {
      return next(
        new InputError(
          'Required fields: category, nominations, canon_id || canon_nom'
        )
      )
    }

    const getInsertQuery = canon_id => {
      const values = nominations.map(nomination => ({
        category,
        nomination,
        canon_id
      }))
      const cs = new this.pgp.helpers.ColumnSet(
        ['category', 'nomination:json', 'canon_id'],
        {
          table: 'classification'
        }
      )
      return `
        ${this.pgp.helpers.insert(values, cs)}
        ON CONFLICT (category, nomination)
          DO UPDATE SET canon_id = EXCLUDED.canon_id
      `
    }
    ;(req.body.canon_nom
      ? this._classifyWithObject(category, req.body.canon_nom, getInsertQuery)
      : this.db.none(getInsertQuery(req.body.canon_id || null))
    )
      .then(() => res.status(200).json({ status: 'success' }))
      .catch(next)
  }

  updateCanonEntry(req, res, next) {
    if (!req.body) return next(new InputError('Empty POST body!?'))
    const data = {
      id: parseInt(req.params.id),
      category: req.body.category,
      nomination: req.body.nomination,
      disqualified: req.body.disqualified || false,
      relocated: req.body.relocated || null
    }
    if (!data.category || !data.nomination) {
      return next(new InputError('Required fields: category, nomination'))
    }
    this.db
      .one(
        `
         UPDATE Canon
            SET category = $(category),
                nomination = $(nomination)::jsonb,
                disqualified = $(disqualified),
                relocated = $(relocated)
          WHERE id = $(id)
      RETURNING id`,
        data
      )
      .then(() => res.status(200).json({ status: 'success' }))
      .catch(next)
  }

  _csvVoteResults(place, finalists, { rounds, runoff, winner }) {
    return finalists.map(({ id, title }) => {
      const row = rounds.reduce(
        (row, { tally }, i) => {
          const { votes } = tally.find(fv => fv.finalist === id) || {}
          row[`Round ${i + 1}`] = votes || 0
          return row
        },
        { Place: place, Finalist: title }
      )
      if (runoff)
        row.Runoff = id === winner ? runoff.wins : id === -1 ? runoff.losses : 0
      return row
    })
  }

  _jsonVoteResults(place, finalists, { rounds, runoff, winner }) {
    const getFinalistTitle = id => finalists.find(f => f.id === id).title
    rounds.forEach(round => {
      round.tally.forEach(fv => {
        fv.finalist = getFinalistTitle(fv.finalist)
      })
      if (round.eliminated)
        round.eliminated = round.eliminated.map(getFinalistTitle)
      if (round.winner) round.winner = getFinalistTitle(round.winner)
    })
    return { rounds, runoff, place, winner: winner && getFinalistTitle(winner) }
  }

  getVoteResults(req, res, next) {
    const { category } = req.params
    const { csv } = req.query
    this.db
      .task(t =>
        t.batch([
          t.any(`SELECT votes FROM CurrentVotes WHERE category = $1`, category),
          t.any(`SELECT id, title FROM Finalists WHERE category = $1`, category)
        ])
      )
      .then(([ballots, finalists]) => {
        finalists.push({ id: -1, title: 'No award' })
        const data = []
        let place = 1
        while (finalists.length > 1) {
          const placeResults = countVotes(
            ballots.map(b => b.votes),
            finalists.map(f => f.id)
          )
          const { winner } = placeResults
          if (csv) {
            data.push.apply(
              data,
              this._csvVoteResults(place, finalists, placeResults)
            )
          } else {
            data.push(this._jsonVoteResults(place, finalists, placeResults))
          }
          if (!winner) break
          finalists = finalists.filter(({ id }) => id !== winner)
          ++place
        }
        if (csv) {
          res.csv(data, true, {
            'Content-Disposition': `inline; filename="${category}.csv"`
          })
        } else {
          res.json(data)
        }
      })
      .catch(next)
  }
}

module.exports = Admin
