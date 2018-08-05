const { AuthError, InputError } = require('./errors');

module.exports = {
  getDaypassStats, getPublicPeople, getPublicStats, lookupPerson
};

function getDaypassStats(req, res, next) {
  const csv = !!(req.query.csv);
  req.app.locals.db.any('SELECT * FROM daypass_stats')
    .then(data => {
      if (csv) res.csv(data, true);
      else {
        const days = { Wed: {}, Thu: {}, Fri: {}, Sat: {}, Sun: {} }
        data.forEach(row => {
          Object.keys(days).forEach(day => {
            if (row[day]) days[day][row.status] = row[day]
          })
        })
        res.json(days);
      }
    })
    .catch(next);
}

function getPublicPeople(req, res, next) {
  const csv = !!(req.query.csv);
  req.app.locals.db.any('SELECT * FROM public_members')
    .then(data => {
      if (csv) res.csv(data, true);
      else res.json(data);
    })
    .catch(next);
}

function getPublicStats(req, res, next) {
  const csv = !!(req.query.csv);
  req.app.locals.db.any('SELECT * from country_stats')
    .then(rows => {
      if (csv) return res.csv(rows, true);
      const data = {}
      rows.forEach(({ country, membership, count }) => {
        const c = data[country]
        if (c) c[membership] = Number(count)
        else data[country] = { [membership]: Number(count) }
      })
      res.json(data);
    })
    .catch(next);
}

function lookupPerson(req, res, next) {
  if (!req.session || !req.session.user || !req.session.user.email) return next(new AuthError());
  const { email, member_number, name } = req.body;
  const queryParts = [];
  const queryValues = {};
  if (email && /.@./.test(email)) {
    queryParts.push('lower(email) = $(email)');
    queryValues.email = email.trim().toLowerCase();
  }
  if (member_number > 0) {
    queryParts.push('(member_number = $(number) OR id = $(number))');
    queryValues.number = Number(member_number);
  }
  if (name) {
    queryParts.push('(lower(legal_name) = $(name) OR lower(public_name(p)) = $(name))');
    queryValues.name = name.trim().toLowerCase();
  }
  if (queryParts.length === 0 || (queryParts.length === 1 && queryValues.number)) {
    return next(new InputError('No valid parameters'));
  }
  req.app.locals.db.any(`
    SELECT id, membership, preferred_name(p) AS name
    FROM people p
      LEFT JOIN membership_types m USING (membership)
    WHERE ${queryParts.join(' AND ')} AND
      m.allow_lookup = true`, queryValues
  )
    .then(results => {
      switch (results.length) {
        case 0: return res.json({ status: 'not found' });
        case 1: return res.json(Object.assign({ status: 'success' }, results[0]));
        default: return res.json({ status: 'multiple' });
      }
    })
    .catch(next);
}
