const fetch = require('node-fetch')
const { AuthError, InputError } = require('@kansa/errors')

class Nominate {
  static access(req, db) {
    const id = parseInt(req.params.id)
    if (isNaN(id) || id <= 0)
      return Promise.reject(new InputError('Bad id number'))
    const { user } = req.session
    if (!user || !user.email) return Promise.reject(new AuthError())
    return db
      .oneOrNone(
        `SELECT 1
        FROM kansa.people
          LEFT JOIN kansa.membership_types USING (membership)
        WHERE id = $1 AND hugo_nominator = true`,
        id
      )
      .then(ok => {
        if (!ok) throw new AuthError()
        return id
      })
  }

  constructor(db) {
    this.db = db
    this.getNominations = this.getNominations.bind(this)
    this.nominate = this.nominate.bind(this)
  }

  getNominations(req, res, next) {
    const distinct = !req.query.all
    return this.db
      .task(dbTask =>
        Nominate.access(req, dbTask)
          .then(id =>
            dbTask.any(
              `SELECT ${distinct ? 'DISTINCT ON (category)' : ''} *
              FROM Nominations
              WHERE person_id = $1
              ORDER BY category, time DESC`,
              id
            )
          )
          .then(data => res.json(data))
      )
      .catch(next)
  }

  sendNominationEmail(dbTask, id) {
    const url = 'http://kyyhky/email/hugo-update-nominations?delay=30'
    dbTask
      .batch([
        dbTask.one(
          `SELECT
            k.email, k.key, p.legal_name, p.public_first_name AS pfn,
            p.public_last_name AS pln
          FROM kansa.People AS p JOIN kansa.Keys AS k USING (email)
          WHERE id = $1`,
          id
        ),
        dbTask.any(
          `SELECT DISTINCT ON (category) *
          FROM Nominations
          WHERE person_id = $1 ORDER BY category, time DESC`,
          id
        )
      ])
      .then(([person, nominations]) =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: person.email,
            key: person.key,
            memberId: id,
            name:
              [person.pfn, person.pln]
                .filter(n => n)
                .join(' ')
                .trim() || person.legal_name,
            nominations
          })
        })
      )
      .catch(err => console.error(err))
  }

  nominate(req, res, next) {
    const data = {
      client_ip: req.ip,
      client_ua: req.headers['user-agent'] || null,
      person_id: null,
      signature: req.body && req.body.signature,
      category: req.body && req.body.category,
      nominations: req.body && req.body.nominations
    }
    if (!data.client_ip) return next(new Error('No client IP address!?'))
    if (!data.signature || !data.category || !data.nominations)
      return next(
        new InputError('Required parameters: signature, category, nominations')
      )
    if (typeof data.nominations === 'string')
      try {
        data.nominations = JSON.parse(data.nominations)
      } catch (e) {
        return next(new InputError(e.message))
      }
    if (!Array.isArray(data.nominations))
      return next(new InputError('Nominations should be an array'))
    return this.db
      .task(dbTask =>
        Nominate.access(req, dbTask)
          .then(id => {
            data.person_id = id
            const keys = Object.keys(data)
            const values = keys
              .map(
                fn =>
                  fn === 'nominations' ? '$(nominations)::jsonb[]' : `$(${fn})`
              )
              .join(', ')
            const cols = keys.join(', ')
            return dbTask.one(
              `INSERT INTO Nominations (${cols}) VALUES (${values}) RETURNING time`,
              data
            )
          })
          .then(({ time }) => {
            res.json(Object.assign({ status: 'success', time }, data))
            this.sendNominationEmail(dbTask, data.person_id)
          })
      )
      .catch(next)
  }
}

module.exports = Nominate
