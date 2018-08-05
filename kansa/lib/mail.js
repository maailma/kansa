const fetch = require('node-fetch');

module.exports = {
  mailTask, setAllMailRecipients, updateMailRecipient
}

function mailTask(type, data, delay) {
  let url = `http://kyyhky/email/${type}`
  if (delay) url += `?delay=${Number(delay)}` // in minutes
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

const mailRecipient = (email, res) => {
  let name = res[0].name
  switch (res.length) {
    case 0: return { email, delete: true }
    case 1: break
    case 2:
      name += ' and ' + res[1].name
      break
    default:
      const names = res.map(r => r.name)
      const last = names.length - 1
      names[last] = 'and ' + names[last]
      name = names.join(', ')
  }
  const attending = res
    .filter(r => r.badge || r.daypass)
    .map(({ id, name }) => ({ id, name }))
  const hugo_members = res
    .filter(r => r.hugo_nominator || r.wsfs_member)
    .map(({ id, name }) => ({ id, name }))
  return {
    attending,
    email: res[0].email,
    hugo_members,
    key: res[0].key,
    membership: res[0].membership, // FIXME
    name
  }
}
mailRecipient.selector = `
  SELECT
    email, key, p.id, membership, preferred_name(p) as name,
    m.badge, m.hugo_nominator, m.wsfs_member,
    d.status AS daypass
  FROM people p
    LEFT JOIN keys USING (email)
    LEFT JOIN membership_type m USING (membership)
    LEFT JOIN daypasses d ON (p.id = d.person_id)`

function rxUpdateTask(recipients) {
  return fetch('http://kyyhky/update-recipients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipients)
  })
}

function setAllMailRecipients(req, res, next) {
  req.app.locals.db.any(`${mailRecipient.selector} ORDER BY email`)
    .then(res => {
      const er = res.reduce((set, r) => {
        if (set[r.email]) set[r.email].push(r)
        else set[r.email] = [r]
        return set
      }, {})
      const emails = Object.keys(er)
      const recipients = emails.map(email => mailRecipient(email, er[email]))
      return rxUpdateTask(recipients).then(() => emails.length)
    })
    .then(count => res.json({ success: true, count }))
    .catch(next)
}

function updateMailRecipient(db, email) {
  return db.any(`${mailRecipient.selector} WHERE email ILIKE $1`, email)
    .then(res => rxUpdateTask([mailRecipient(email, res)]))
    .catch(err => console.error('updateMailRecipient:', err))
}
