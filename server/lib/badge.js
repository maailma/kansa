const fetch = require('node-fetch')
const config = require('@kansa/common/config')
const { AuthError } = require('@kansa/common/errors')
const splitName = require('@kansa/common/split-name')

module.exports = { getBadge, getBarcode, logPrint }

function getBadge(req, res, next) {
  const id = parseInt(req.params.id || '0')
  req.app.locals.db
    .oneOrNone(
      `SELECT
        p.member_number, membership,
        get_badge_name(p) AS name, get_badge_subtitle(p) AS subtitle
      FROM people p
        LEFT JOIN membership_types m USING (membership)
      WHERE id = $1 AND m.badge = true`,
      id
    )
    .then(data => {
      const { member_number, membership, name, subtitle } = data || {}
      const [FirstName, Surname] = splitName(req.query.name || name || '')
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
      const [FirstName, Surname] = splitName(name || '')
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
  req.app.locals.db
    .one(
      `INSERT INTO badge_and_daypass_prints
        (person, membership, member_number, daypass)
      (
        SELECT p.id, p.membership, p.member_number, d.id
        FROM people p LEFT JOIN daypasses d ON (p.id = d.person_id)
        WHERE p.id = $1
      ) RETURNING timestamp`,
      parseInt(req.params.id)
    )
    .then(({ timestamp }) => res.json({ status: 'success', timestamp }))
    .catch(next)
}
