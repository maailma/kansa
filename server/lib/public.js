const config = require('./config')
const { AuthError, InputError } = require('./errors')

module.exports = {
  getConfig,
  getDaypassStats,
  getPublicPeople,
  getPublicStats,
  lookupPerson
}

function getConfig(req, res, next) {
  req.app.locals.db
    .any(
      `
    SELECT membership, badge, hugo_nominator, member, wsfs_member
    FROM membership_types`
    )
    .then(rows => {
      const membershipTypes = {}
      rows.forEach(({ membership, ...props }) => {
        membershipTypes[membership] = props
      })
      res.json(Object.assign({ membershipTypes }, config, { auth: undefined }))
    })
    .catch(next)
}

function getDaypassStats(req, res, next) {
  const csv = !!req.query.csv
  req.app.locals.db
    .any('SELECT * FROM daypass_stats')
    .then(data => {
      if (csv) res.csv(data, true)
      else {
        const days = { Wed: {}, Thu: {}, Fri: {}, Sat: {}, Sun: {} }
        data.forEach(row => {
          Object.keys(days).forEach(day => {
            if (row[day]) days[day][row.status] = row[day]
          })
        })
        res.json(days)
      }
    })
    .catch(next)
}

function getPublicPeople(req, res, next) {
  const csv = !!req.query.csv
  req.app.locals.db
    .any('SELECT * FROM public_members')
    .then(data => {
      if (csv) res.csv(data, true)
      else res.json(data)
    })
    .catch(next)
}

function getPublicStats(req, res, next) {
  const csv = !!req.query.csv
  req.app.locals.db
    .any('SELECT * from country_stats')
    .then(rows => {
      if (csv) return res.csv(rows, true)
      const data = {}
      rows.forEach(({ country, membership, count }) => {
        const c = data[country]
        if (c) c[membership] = Number(count)
        else data[country] = { [membership]: Number(count) }
      })
      res.json(data)
    })
    .catch(next)
}

function getLookupQuery({ email, member_number, name }) {
  const parts = []
  const values = {}
  if (email && /.@./.test(email)) {
    parts.push('lower(email) = $(email)')
    values.email = email.trim().toLowerCase()
  }
  if (member_number > 0) {
    parts.push('(member_number = $(number) OR id = $(number))')
    values.number = Number(member_number)
  }
  if (name) {
    parts.push(
      '(lower(legal_name) = $(name) OR lower(public_name(p)) = $(name))'
    )
    values.name = name.trim().toLowerCase()
  }
  if (parts.length === 0 || (parts.length === 1 && values.number)) {
    throw new InputError('No valid parameters')
  }
  const query = `
    SELECT id, membership, preferred_name(p) AS name
    FROM people p
      LEFT JOIN membership_types m USING (membership)
    WHERE ${parts.join(' AND ')} AND
      m.allow_lookup = true`
  return { query, values }
}

function lookupPerson(req, res, next) {
  if (!req.session || !req.session.user || !req.session.user.email)
    return next(new AuthError())
  const { query, values } = getLookupQuery(req.body)
  req.app.locals.db
    .any(query, values)
    .then(results => {
      switch (results.length) {
        case 0:
          return res.json({ status: 'not found' })
        case 1:
          return res.json(Object.assign({ status: 'success' }, results[0]))
        default:
          return res.json({ status: 'multiple' })
      }
    })
    .catch(next)
}
