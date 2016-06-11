const damm = require('damm');
const LogEntry = require('./types/logentry');
const Person = require('./types/person');

module.exports = { getPublicPeople, getPublicStats, getPeople, getPerson, addPerson, updatePerson };

function getPublicPeople(req, res, next) {
  req.app.locals.db.any(`SELECT country, membership,
      concat_ws(' ', public_first_name, public_last_name) AS public_name
      FROM People WHERE membership != 'NonMember' AND (public_first_name != '' OR public_last_name != '')
      ORDER BY public_last_name, public_first_name, country`)
    .then(data => {
      res.status(200).json({ status: 'success', data });
    })
    .catch(err => next(err));
}

function getPublicStats(req, res, next) {
  req.app.locals.db.any(`SELECT country, membership, COUNT(*)
      FROM People WHERE membership != 'NonMember'
      GROUP BY CUBE(country, membership)`)
    .then(data => {
      const members = data.reduce((stats, d) => {
        const c = d.country || '';
        const m = d.membership || 'total'
        if (!stats[c]) stats[c] = {};
        stats[c][m] = parseInt(d.count);
        return stats;
      }, {});
      res.status(200).json({ status: 'success', members });
    })
    .catch(err => next(err));
}

function getPeopleQuery(req, res, next) {
  const cond = Object.keys(req.query).map(fn => { switch(fn) {
    case 'since':
      return 'last_modified > $(since)';
    case 'name':
      return '(legal_name ILIKE $(name) OR public_first_name ILIKE $(name) OR public_last_name ILIKE $(name))';
    case 'member_number':
    case 'membership':
    case 'can_hugo_nominate':
    case 'can_hugo_vote':
    case 'can_site_select':
      return `${fn} = $(${fn})`;
    default:
      return (Person.fields.indexOf(fn) !== -1) ? `${fn} ILIKE $(${fn})` : 'true';
  }});
  req.app.locals.db.any(`SELECT * FROM People WHERE ${cond.join(' AND ')}`, req.query)
    .then(data => res.status(200).json(data))
    .catch(err => next(err));
}

function getPeople(req, res, next) {
  if (!req.session.user.member_admin) return res.status(401).json({ status: 'unauthorized' });
  if (Object.keys(req.query).length > 0) getPeopleQuery(req, res, next);
  else req.app.locals.db.any('SELECT * FROM People')
    .then(data => {
      const maxId = data.reduce((m, p) => Math.max(m, p.id), -1);
      if (isNaN(maxId)) {
        res.status(500).json({ status: 'error', message: 'Contains non-numeric id?', data });
      } else {
        const arr = new Array(maxId + 1);
        data.forEach(p => {
          arr[p.id] = Person.fields.reduce((o, fn) => {
            const v = p[fn];
            if (v !== null && v !== false) o[fn] = v;
            return o;
          }, { id: p.id });
        });
        res.status(200).json(arr);
      }
    })
    .catch(err => next(err));
}

function getPerson(req, res, next) {
  const id = parseInt(req.params.id);
  req.app.locals.db.one('SELECT * FROM People WHERE id = $1', id)
    .then(data => res.status(200).json(data))
    .catch(err => next(err));
}

function addPerson(req, res, next) {
  if (!req.session.user.member_admin) return res.status(401).json({ status: 'unauthorized' });
  let id, person;
  try {
    person = new Person(req.body);
  } catch (e) {
    return res.status(400).json({ status: 'error', message: e.message });
  }
  const setNumber = !person.data.member_number && person.data.membership !== 'NonMember';
  req.app.locals.db.tx(tx => tx.sequence((i, data) => { switch (i) {
    case 0:
      return setNumber ? tx.one('SELECT max(member_number) FROM People') : {};
    case 1:
      if (setNumber) {
        const root = data.max ? Math.floor(data.max / 10) + 1 : 1;
        const nStr = damm.append(root.toString());
        person.data.member_number = parseInt(nStr);
      }
      return tx.one(`INSERT INTO People ${person.sqlValues} RETURNING id`, person.data);
    case 2:
      const log = new LogEntry(req, 'Add new person');
      id = log.subject = parseInt(data.id);
      return tx.none(`INSERT INTO Log ${log.sqlValues}`, log);
  }}))
  .then(() => { res.status(200).json({ status: 'success', id }); })
  .catch(err => next(err));
}

function updatePerson(req, res, next) {
  const data = Object.assign({}, req.body);
  const isMemberAdmin = req.session.user.member_admin;
  const fieldSrc = isMemberAdmin ? Person.fields : Person.userModFields;
  const fields = fieldSrc.filter(fn => data.hasOwnProperty(fn));
  if (fields.length == 0) return res.status(400).json({ status: 'error', message: 'No valid parameters' });
  let ppCond = '';
  if (fields.indexOf('paper_pubs') >= 0) try {
    data.paper_pubs = Person.cleanPaperPubs(data.paper_pubs);
    if (!isMemberAdmin) {
      if (data.paper_pubs) ppCond = 'AND paper_pubs IS NOT NULL';
      else fields.splice(fields.indexOf('paper_pubs'), 1);
    }
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'paper_pubs: ' + e.message });
  }
  const sqlFields = fields.map(fn => `${fn}=$(${fn})`).join(', ');
  const log = new LogEntry(req, 'Update fields: ' + fields.join(', '));
  data.id = log.subject = parseInt(req.params.id);
  req.app.locals.db.tx(tx => tx.batch([
    tx.one(`UPDATE People SET ${sqlFields} WHERE id=$(id) ${ppCond} RETURNING true`, data),
    tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
  ]))
    .then(() => res.status(200).json({ status: 'success', updated: fields }))
    .catch(err => (ppCond && !err[0].success && err[1].success && err[0].result.message == 'No data returned from the query.')
      ? res.status(402).json({ status: 'error', message: 'Paper publications have not been enabled for this person' })
      : next(err));
}
