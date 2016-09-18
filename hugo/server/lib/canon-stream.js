class CanonStream {
  constructor(db) {
    this.clients = [];
    this.connected = false;
    this.db = db;
    this.sco = null;
  }

  connect() {
    if (!this.connected) this.db.connect()
      .then(sco => {
        this.sco = sco;
        sco.client.on('notification', msg => {
          if (msg.payload) this.clients.forEach(ws => ws.send(msg.payload));
        });
        this.connected = true;
        return sco.none('LISTEN $1~', 'canon');
      })
      .catch(err => {
        this.connected = false;
        console.error('CanonStream failed!', err);
      });
  }

  addClient(client) {
    this.clients.push(client);
    client.on('close', () => { this.removeClient(client); });
    this.connect();
  }

  removeClient(client) {
    const i = this.clients.indexOf(client);
    if (i != -1) this.clients.splice(i, 1);
    if (this.clients.length == 0) {
      this.connected = false;
      if (this.sco) this.sco.done();
      this.sco = null;
    }
  }
}

module.exports = CanonStream;
