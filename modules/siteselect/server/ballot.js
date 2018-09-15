const fetch = require('node-fetch')
const { AuthError, InputError } = require('@kansa/common/errors')

// source is at /config/siteselection/ballot-data.js
const ballotData = require('/ss-ballot-data')

class Ballot {
  constructor(db) {
    this.db = db
    this.getBallot = this.getBallot.bind(this)
  }

  getBallot(req, res, next) {
    const id = parseInt(req.params.id)
    if (isNaN(id) || id <= 0)
      return next(new InputError('Invalid id parameter'))
    const { user } = req.session
    return this.db
      .task(async t => {
        let pq = `SELECT
            member_number, legal_name, email, city, state, country,
            badge_name, paper_pubs
          FROM People WHERE id = $(id)`
        if (!user.siteselection) pq += ` and email = $(email)`
        const person = await t.oneOrNone(pq, { id, email: user.email })
        if (!person) throw new AuthError()
        const token = await t.oneOrNone(
          `SELECT data->>'token' AS token
          FROM payments WHERE
            person_id = $1 AND type = 'ss-token' AND data->>'token' IS NOT NULL
          LIMIT 1`,
          id,
          r => r && r.token
        )
        const data = ballotData(person, token)
        const pdfRes = await fetch('http://tuohi:3000/ss-ballot.pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        res.setHeader('Content-Type', 'application/pdf')
        pdfRes.body.pipe(res)
      })
      .catch(next)
  }
}

module.exports = Ballot
