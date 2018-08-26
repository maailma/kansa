const randomstring = require('randomstring')
const { AuthError, InputError } = require('./errors')

class Siteselect {
  static generateToken () {
    return randomstring.generate({
      length: 6,
      charset: 'ABCDEFHJKLMNPQRTUVWXY0123456789'
    })
  }

  static parseToken (token) {
    return token && token
      .trim()
      .toUpperCase()
      .replace(/G/g, '6')
      .replace(/I/g, '1')
      .replace(/O/g, '0')
      .replace(/S/g, '5')
      .replace(/Z/g, '2')
  }

  constructor(db) {
    this.db = db
    this.verifyAccess = this.verifyAccess.bind(this)
    this.findToken = this.findToken.bind(this)
    this.findVoterTokens = this.findVoterTokens.bind(this)
    this.getTokens = this.getTokens.bind(this)
    this.getVoters = this.getVoters.bind(this)
    this.vote = this.vote.bind(this)
  }

  verifyAccess (req, res, next) {
    if (req.session.user && req.session.user.siteselection) next()
    else next(new AuthError())
  }

  findToken (req, res, next) {
    const token = Siteselect.parseToken(req.params.token)
    if (!token) return res.status(404).json({ error: 'not found' })
    this.db.oneOrNone(`SELECT * FROM token_lookup WHERE token=$1`, token)
      .then(data => {
        if (data) res.json(data)
        else res.status(404).json({ error: 'not found' })
      })
      .catch(next)
  }

  findVoterTokens (req, res, next) {
    const { id } = req.params
    if (!id) return res.status(404).json({ error: 'not found' })
    this.db.any(`
      SELECT token, payment_email, used, voter_name, voter_email
        FROM tokens WHERE person_id=$1
       UNION
      SELECT null, null, time AS used, voter_name, voter_email
        FROM siteselection_votes WHERE person_id=$1 AND token IS NULL`, id)
      .then(data => res.json(data))
      .catch(next)
  }

  getTokens (req, res, next) {
    const csv = req.params.fmt === 'csv'
    this.db.any(`SELECT * FROM token_lookup ORDER BY token`)
      .then(data => {
        if (csv) res.csv(data, true)
        else res.json(data)
      })
      .catch(next)
  }

  getVoters (req, res, next) {
    const csv = req.params.fmt === 'csv'
    this.db.any(`SELECT * FROM siteselection_votes ORDER BY time`)
      .then(data => {
        if (csv) res.csv(data, true)
        else res.json(data)
      })
      .catch(next)
  }

  vote (req, res, next) {
    const { id } = req.params
    const token = Siteselect.parseToken(req.body.token)
    let { voter_name, voter_email } = req.body
    this.db.tx(tx => tx.sequence((i, data) => { switch (i) {
      case 0:
        return token ? tx.one(`SELECT used FROM tokens WHERE token=$1`, token) : {}

      case 1:
        if (!data) throw new InputError(`Token not found`)
        if (data.used) throw new InputError(`Token already used at ${data.used}`)
        return this.db.oneOrNone(`
          SELECT p.legal_name, p.email, s.time AS vote_time
            FROM people p LEFT JOIN siteselection_votes s ON (p.id = s.person_id)
           WHERE p.id = $1 AND p.membership IN
                 ('Supporter','YoungAdult','Unwaged','Adult')`, id)

      case 2:
        if (!data) throw new InputError('Voter not found')
        if (data.vote_time) throw new InputError(`Already voted at ${data.vote_time}`)
        if (!voter_name && !voter_email) {
          voter_name = data.legal_name
          voter_email = data.email
        }
        this.db.none(`
          INSERT INTO siteselection_votes (person_id, token, voter_name, voter_email)
               VALUES ($(id), $(token), $(voter_name), $(voter_email))`,
          {
            id,
            token: token || null,
            voter_name: voter_name || null,
            voter_email: voter_email || null
          }
        )
    }}))
      .then(() => res.json({ status: 'success', voter_name, voter_email }))
      .catch(next)
  }
}

module.exports = Siteselect
