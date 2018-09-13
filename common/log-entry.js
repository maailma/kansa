const logFields = [
  // id SERIAL PRIMARY KEY
  'timestamp', // timestamptz NOT NULL DEFAULT now()
  'client_ip', // text NOT NULL
  'client_ua', // text
  'author', // text
  'subject', // integer REFERENCES People
  'action', // text NOT NULL
  'parameters', // jsonb NOT NULL
  'description' // text NOT NULL
]

class LogEntry {
  constructor(req, desc = '') {
    const { user } = req.session
    this.timestamp = null
    if (user && user.member_admin && req.body && req.body.timestamp) {
      const ts = new Date(req.body.timestamp)
      if (ts > 0) this.timestamp = ts.toISOString()
    }
    this.client_ip = req.ip
    this.client_ua = req.headers['user-agent'] || null
    this.author = (user && user.email) || null
    this.subject = null
    this.action = req.method + ' ' + req.baseUrl + req.path
    this.parameters = Object.assign({}, req.query, req.body)
    delete this.parameters.key
    this.description = desc
  }

  write(db) {
    const fields = logFields.filter(fn => this[fn] !== null)
    const values = fields.map(fn => `$(${fn})`).join(', ')
    const sqlValues = `(${fields.join(', ')}) VALUES(${values})`
    return db.none(`INSERT INTO log ${sqlValues}`, this)
  }
}

module.exports = LogEntry
