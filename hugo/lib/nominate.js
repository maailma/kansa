const fetch = require('node-fetch');

const AuthError = require('./errors').AuthError;
const InputError = require('./errors').InputError;


module.exports = { getNominations, nominate };


function access(req) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 0) return Promise.reject(new InputError('Bad id number'));
  if (!req.session || !req.session.user || !req.session.user.email) return Promise.reject(new AuthError());
  return req.app.locals.db.oneOrNone('SELECT email, can_hugo_nominate, can_hugo_vote FROM kansa.People WHERE id = $1', id)
    .then(data => {
      if (!data || !req.session.user.hugo_admin && req.session.user.email !== data.email) throw new AuthError();
      return {
        id,
        nominator: !!data.can_hugo_nominate,
        voter: !!data.can_hugo_vote
      };
    });
}


function getNominations(req, res, next) {
  const distinct = req.query.all ? '' : 'DISTINCT ON (category)';
  access(req)
    .then(({ id }) => req.app.locals.db.any('SELECT $1^ * FROM Nominations WHERE person_id = $2 ORDER BY category, time DESC', [ distinct, id ]))
    .then(data => res.status(200).json(data))
    .catch(err => next(err));
}


function sendNominationEmail(db, id) {
  const url = 'http://kyyhky:3000/email/hugo-update-nominations?delay=30'
  db.task(t => t.batch([
    t.one(`SELECT
      k.email, k.key, p.legal_name, p.public_first_name AS pfn, p.public_last_name AS pln
      FROM kansa.People AS p
      JOIN kansa.Keys AS k USING (email)
      WHERE id = $1`, id),
    t.any(`SELECT DISTINCT ON (category) * FROM Nominations
      WHERE person_id = $1 ORDER BY category, time DESC`, id)
  ]))
    .then(([ person, nominations ]) => fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: person.email,
          key: person.key,
          memberId: id,
          name: [person.pfn, person.pln].filter(n => n).join(' ').trim() || person.legal_name,
          nominations
        })
      }))
    .catch(err => console.error(err));
}

function nominate(req, res, next) {
  const data = {
    client_ip: req.ip,
    client_ua: req.headers['user-agent'] || null,
    person_id: null,
    signature: req.body && req.body.signature,
    category: req.body && req.body.category,
    nominations: req.body && req.body.nominations
  };
  if (!data.client_ip) return next(new Error('No client IP address!?'));
  if (!data.signature || !data.category || !data.nominations) return next(
    new InputError('Required parameters: signature, category, nominations')
  );
  if (typeof data.nominations === 'string') try {
    data.nominations = JSON.parse(data.nominations);
  } catch (e) {
    return next(new InputError(e.message));
  }
  if (!Array.isArray(data.nominations)) return next(new InputError('Nominations should be an array'));
  access(req)
    .then(({ id, nominator }) => {
      if (!nominator) throw new AuthError();
      data.person_id = id;
      const keys = Object.keys(data);
      const values = keys.map(fn => fn === 'nominations' ? '$(nominations)::jsonb[]' : `$(${fn})`).join(', ');
      return req.app.locals.db.one(`INSERT INTO Nominations (${keys.join(', ')}) VALUES (${values}) RETURNING time`, data);
    })
    .then(({ time }) => {
      res.status(200).json(Object.assign({ status: 'success', time }, data));
      sendNominationEmail(req.app.locals.db, data.person_id);
    })
    .catch(err => next(err));
}
