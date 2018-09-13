const { InputError, NotFoundError } = require('@kansa/common/errors')
const { parseToken } = require('./token')

class Admin {
  constructor(db) {
    this.db = db
    this.findToken = this.findToken.bind(this)
    this.findVoterTokens = this.findVoterTokens.bind(this)
    this.getTokens = this.getTokens.bind(this)
    this.getVoters = this.getVoters.bind(this)
    this.vote = this.vote.bind(this)
  }

  findToken(req, res, next) {
    const token = parseToken(req.params.token)
    if (!token) return next(new NotFoundError())
    this.db
      .oneOrNone(`SELECT * FROM token_lookup WHERE token=$1`, token)
      .then(data => {
        if (!data) throw new NotFoundError()
        res.json(data)
      })
      .catch(next)
  }

  findVoterTokens(req, res, next) {
    const { id } = req.params
    if (!id) return next(new NotFoundError())
    this.db
      .any(
        `
      SELECT token, payment_email, used, voter_name, voter_email
        FROM tokens WHERE person_id=$1
       UNION
      SELECT null, null, time AS used, voter_name, voter_email
        FROM siteselection_votes WHERE person_id=$1 AND token IS NULL`,
        id
      )
      .then(data => res.json(data))
      .catch(next)
  }

  getTokens(req, res, next) {
    const csv = req.params.fmt === 'csv'
    this.db
      .any(`SELECT * FROM token_lookup ORDER BY token`)
      .then(data => {
        if (csv) res.csv(data, true)
        else res.json(data)
      })
      .catch(next)
  }

  getVoters(req, res, next) {
    const csv = req.params.fmt === 'csv'
    this.db
      .any(`SELECT * FROM siteselection_votes ORDER BY time`)
      .then(data => {
        if (csv) res.csv(data, true)
        else res.json(data)
      })
      .catch(next)
  }

  vote(req, res, next) {
    const { id } = req.params
    const token = parseToken(req.body.token)
    let { voter_name, voter_email } = req.body
    this.db
      .task(dbTask =>
        (token
          ? dbTask.oneOrNone(`SELECT used FROM tokens WHERE token=$1`, token)
          : Promise.resolve({})
        )
          .then(data => {
            if (!data) throw new InputError(`Token not found`)
            if (data.used)
              throw new InputError(`Token already used at ${data.used}`)
            return dbTask.oneOrNone(
              `
            SELECT p.legal_name, p.email, s.time AS vote_time
            FROM people p
              LEFT JOIN siteselection_votes s ON (p.id = s.person_id)
              LEFT JOIN membership_types m USING (membership)
            WHERE p.id = $1 AND m.wsfs_member = true`,
              id
            )
          })
          .then(data => {
            if (!data) throw new InputError('Voter not found')
            if (data.vote_time)
              throw new InputError(`Already voted at ${data.vote_time}`)
            if (!voter_name && !voter_email) {
              voter_name = data.legal_name
              voter_email = data.email
            }
            return dbTask.none(
              `
            INSERT INTO siteselection_votes (person_id, token, voter_name, voter_email)
            VALUES ($(id), $(token), $(voter_name), $(voter_email))`,
              {
                id,
                token: token || null,
                voter_name: voter_name || null,
                voter_email: voter_email || null
              }
            )
          })
      )
      .then(() => res.json({ status: 'success', voter_name, voter_email }))
      .catch(next)
  }
}

module.exports = Admin
