class LogEntry {
  static get fields() {
    return [
      // id SERIAL PRIMARY KEY
      'timestamp',  // timestamptz NOT NULL
      'client_info',  // text NOT NULL
      'author',  // text
      'subject',  // integer REFERENCES People
      'action',  // text NOT NULL
      'parameters',  // jsonb NOT NULL
      'description'  // text NOT NULL
    ];
  }

  static get sqlValues() {
    const fields = LogEntry.fields;
    const values = fields.map(fn => `$(${fn})`).join(', ');
    return `(${fields.join(', ')}) VALUES(${values})`;
  }

  constructor(req, author = null, desc = '') {
    this.timestamp = new Date().toISOString();
    this.client_info = req.ip || 'no-IP';
    const ua = req.headers['User-Agent'];
    if (ua) this.client_info += '\t' + ua;
    this.author = author;
    this.subject = null;
    this.action = req.method + ' ' + req.originalUrl;
    this.parameters = req.body;
    this.description = desc;
  }
}

module.exports = LogEntry;
