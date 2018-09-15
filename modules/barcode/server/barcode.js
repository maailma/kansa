const fetch = require('node-fetch')
const splitName = require('@kansa/common/split-name')

module.exports = { getBarcodeId, getBarcodeData, fetchBarcode }

function getBarcodeId(membership, member_number, id) {
  const ch = membership.charAt(0)
  const num = member_number || `i${id}`
  return `${ch}-${num}`
}

function getBarcodeData(db, id, key) {
  return db.oneOrNone(
    `SELECT p.id, member_number, membership,
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
}

function fetchBarcode(
  dayNames,
  format,
  { daypass, days, id, member_number, membership, name, subtitle }
) {
  const [FirstName, Surname] = splitName(name || '')
  const Info = daypass
    ? 'Daypass ' + dayNames.filter((_, i) => days[i]).join('/')
    : subtitle || ''
  return fetch('http://tarra/label.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format,
      labeldata: [
        {
          id: getBarcodeId(membership, member_number, id),
          FirstName,
          Surname,
          Info
        }
      ],
      ltype: 'mail'
    })
  })
}
