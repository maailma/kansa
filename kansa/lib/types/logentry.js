class LogEntry {
  static get fields() {
    return [
      // id SERIAL PRIMARY KEY
      'timestamp',  // timestamptz NOT NULL DEFAULT now()
      'client_ip',  // text NOT NULL
      'client_ua',  // text
      'author',  // text
      'subject',  // integer REFERENCES People
      'action',  // text NOT NULL
      'parameters',  // jsonb NOT NULL
      'description'  // text NOT NULL
    ];
  }

  constructor(req, desc = '') {
    this.timestamp = null;
    if (req.session && req.session.user && req.session.user.member_admin && req.body && req.body.timestamp) {
      const ts = new Date(req.body.timestamp);
      if (ts > 0) this.timestamp = ts.toISOString();
    }
    this.client_ip = req.ip;
    this.client_ua = req.headers['user-agent'] || null;
    this.author = req.session.user && req.session.user.email || null;
    this.subject = null;
    this.action = req.method + ' ' + req.baseUrl + req.path;
    this.parameters = Object.assign({}, req.query, req.body);
    delete this.parameters.key;
    this.description = desc;
  }

  get sqlValues() {
    const fields = LogEntry.fields.filter(fn => this[fn] !== null);
    const values = fields.map(fn => `$(${fn})`).join(', ');
    return `(${fields.join(', ')}) VALUES(${values})`;
  }
}

module.exports = LogEntry;
