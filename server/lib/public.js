const config = require('@kansa/common/config')

module.exports = {
  getConfig,
  getDaypassStats,
  getPublicPeople,
  getPublicStats
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
