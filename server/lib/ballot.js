const fetch = require('node-fetch')
const ballotData = require('/ss-ballot-data')

class Ballot {
  constructor(db) {
    this.db = db
    this.getBallot = this.getBallot.bind(this)
  }

  getBallot(req, res, next) {
    const id = parseInt(req.params.id)
    this.db
      .any(
        `
      SELECT member_number, legal_name, email, city, state, country, badge_name, paper_pubs, m.data->>'token' as token
        FROM People p JOIN Payments m ON (p.id = m.person_id)
       WHERE p.id = $1 AND m.type = 'ss-token' AND m.data->>'token' IS NOT NULL`,
        id
      )
      .then(data => {
        if (data.length === 0) throw { status: 404, message: 'Not found' }
        return fetch('http://tuohi:3000/ss-ballot.pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ballotData(data[0]))
        })
      })
      .then(pdfRes => {
        res.setHeader('Content-Type', 'application/pdf')
        pdfRes.body.pipe(res)
      })
      .catch(next)
  }
}

module.exports = Ballot
