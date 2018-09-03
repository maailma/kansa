const fetch = require('node-fetch')
const config = require('./config')
const { AuthError } = require('./errors')

const TITLE_MAX_LENGTH = 14

module.exports = { getBadge, getBarcode, logPrint }

const splitNameInTwain = name => {
  name = name.trim()
  if (name.indexOf('\n') !== -1) {
    const nm = name.match(/(.*)\s+([\s\S]*)/)
    const n0 = nm[1].trim()
    const n1 = nm[2].trim().replace(/\s+/g, ' ')
    return [n0, n1]
  } else if (name.length <= TITLE_MAX_LENGTH) {
    return ['', name]
  } else {
    const na = name.split(/\s+/)
    let n0 = na.shift() || ''
    let n1 = na.pop() || ''
    while (na.length) {
      const p0 = na.shift()
      const p1 = na.pop()
      if (p1 && n0.length + p0.length > n1.length + p1.length) {
        n1 = p1 + ' ' + n1
        na.unshift(p0)
      } else if (!p1 && n0.length + p0.length > n1.length + p0.length) {
        n1 = p0 + ' ' + n1
      } else {
        n0 = n0 + ' ' + p0
        if (p1) na.push(p1)
      }
    }
    return [n0, n1]
  }
}

function getBadge(req, res, next) {
  const id = parseInt(req.params.id || '0')
  req.app.locals.db
    .oneOrNone(
      `
    SELECT
      p.member_number, membership,
      get_badge_name(p) AS name, get_badge_subtitle(p) AS subtitle
    FROM people p
      LEFT JOIN membership_types m USING (membership)
    WHERE id = $1 AND m.badge = true`,
      id
    )
    .then(data => {
      const { member_number, membership, name, subtitle } = data || {}
      const [FirstName, Surname] = splitNameInTwain(
        req.query.name || name || ''
      )
      return fetch('http://tarra/label.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'png',
          labeldata: [
            {
              id: String(member_number) || 'number',
              Class: membership,
              FirstName,
              Surname,
              Info: req.query.subtitle || subtitle || ''
            }
          ],
          ltype: 'web'
        })
      }).then(({ body, headers }) => {
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${config.id}-badge-${id}.png"`
        )
        res.setHeader('Content-Type', headers.get('content-type'))
        res.setHeader('Content-Length', headers.get('content-length'))
        body.pipe(res)
      })
    })
    .catch(next)
}

function getBarcode(req, res, next) {
  const id = parseInt(req.params.id)
  const key = req.params.key
  const format = req.params.fmt === 'pdf' ? 'pdf' : 'png'
  req.app.locals.db
    .one(
      `
    SELECT member_number, membership,
      get_badge_name(p) AS name, get_badge_subtitle(p) AS subtitle,
      d.status AS daypass, daypass_days(d) AS days
    FROM people p
      JOIN keys k USING (email)
      LEFT JOIN membership_types m USING (membership)
      LEFT JOIN daypasses d ON (p.id = d.person_id)
    WHERE p.id=$(id) AND
      (m.badge = true OR d.status IS NOT NULL)
      ${key ? 'AND key=$(key)' : ''}`,
      { id, key }
    )
    .then(data => {
      const { daypass, days, member_number, membership, name, subtitle } = data
      const code = membership.charAt(0) + '-' + (member_number || `i${id}`)
      const [FirstName, Surname] = splitNameInTwain(name || '')
      const Info = daypass
        ? 'Daypass ' +
          ['Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            .filter((_, i) => days[i])
            .join('/')
        : subtitle || ''
      return fetch('http://tarra/label.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          labeldata: [
            {
              id: code,
              FirstName,
              Surname,
              Info
            }
          ],
          ltype: 'mail'
        })
      }).then(({ body, headers }) => {
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${config.id}-barcode-${id}.${format}"`
        )
        res.setHeader('Content-Type', headers.get('content-type'))
        res.setHeader('Content-Length', headers.get('content-length'))
        body.pipe(res)
      })
    })
    .catch(error => {
      if (error.message === 'No data returned from the query.') {
        error = new AuthError()
      }
      next(error)
    })
}

function logPrint(req, res, next) {
  const { member_admin } = req.session.user || {}
  if (!member_admin) return next(new AuthError())
  const id = parseInt(req.params.id)
  req.app.locals.db
    .one(
      `
    INSERT INTO badge_and_daypass_prints (person, membership, member_number, daypass) (
         SELECT p.id, p.membership, p.member_number, d.id
           FROM people p LEFT JOIN daypasses d ON (p.id = d.person_id)
          WHERE p.id = $1
    ) RETURNING timestamp`,
      id
    )
    .then(({ timestamp }) => res.json({ status: 'success', timestamp }))
    .catch(next)
}
