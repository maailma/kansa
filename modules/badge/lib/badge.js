const fetch = require('node-fetch')
const { matchesId } = require('@kansa/common/auth-user')
const config = require('@kansa/common/config')
const { InputError } = require('@kansa/common/errors')
const splitName = require('@kansa/common/split-name')

const fetchBadge = ({ member_number, membership, names, subtitle }) =>
  fetch('http://tarra/label.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format: 'png',
      labeldata: [
        {
          id: String(member_number) || 'number',
          Class: membership || '',
          FirstName: names[0],
          Surname: names[1],
          Info: subtitle || ''
        }
      ],
      ltype: 'web'
    })
  })

class Badge {
  constructor(db) {
    this.db = db
    this.getBadge = this.getBadge.bind(this)
    this.getBlank = this.getBlank.bind(this)
    this.logPrint = this.logPrint.bind(this)
  }

  getBlank(req, res, next) {
    const { name, subtitle } = req.query
    return fetchBadge({ names: splitName(name || ''), subtitle })
      .then(({ body, headers }) => {
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${config.id}-badge.png"`
        )
        res.setHeader('Content-Type', headers.get('content-type'))
        res.setHeader('Content-Length', headers.get('content-length'))
        body.pipe(res)
      })
      .catch(next)
  }

  getBadge(req, res, next) {
    this.db
      .task(async ts => {
        const id = await matchesId(ts, req, ['member_admin', 'member_list'])
        const data = await ts.oneOrNone(
          `SELECT p.id, p.member_number, membership,
            get_badge_name(p) AS name,
            get_badge_subtitle(p) AS subtitle
          FROM people p LEFT JOIN membership_types m USING (membership)
          WHERE id = $1 AND m.badge = true`,
          id
        )
        if (!data)
          throw new InputError('This member type is not eligible for a badge')
        return data
      })
      .then(async ({ id, member_number, membership, name, subtitle }) => {
        const { body, headers } = await fetchBadge({
          member_number,
          membership,
          names: splitName(req.query.name || name || ''),
          subtitle: req.query.subtitle || subtitle
        })
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${config.id}-badge-${id}.png"`
        )
        res.setHeader('Content-Type', headers.get('content-type'))
        res.setHeader('Content-Length', headers.get('content-length'))
        body.pipe(res)
      })
      .catch(next)
  }

  logPrint(req, res, next) {
    const id = parseInt(req.params.id)
    if (isNaN(id) || id < 0) return next(new InputError('Bad id number'))
    this.db
      .one(
        `INSERT INTO badge_and_daypass_prints
          (person, membership, member_number, daypass)
        (
          SELECT p.id, p.membership, p.member_number, d.id
          FROM people p LEFT JOIN daypasses d ON (p.id = d.person_id)
          WHERE p.id = $1
        ) RETURNING timestamp`,
        id
      )
      .then(({ timestamp }) => res.json({ status: 'success', timestamp }))
      .catch(next)
  }
}

module.exports = Badge
