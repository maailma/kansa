const fetch = require('node-fetch');

module.exports = {
  mailTask, setAllMailRecipients, updateMailRecipient
}

const mailRecipient = (email, res) => {
  const mt = [ 'NonMember', 'KidInTow', 'Exhibitor', 'Child', 'Supporter', 'Youth', 'FirstWorldcon', 'Adult' ]
    // inlined as types/person.js has Supporter < Child
  const mi = res.reduce((max, r) => Math.max(max, mt.indexOf(r.membership)), -1)
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
  const hugo_members = res
    .filter(r => r.can_hugo_nominate || r.can_hugo_vote)
    .map(({ id, name }) => ({ id, name }))
  return {
    email: res[0].email,
    hugo_members,
    key: res[0].key,
    membership: mt[mi],
    name
  }
}
mailRecipient.selector = `
  SELECT email, key, id, membership, preferred_name(p) as name, can_hugo_nominate, can_hugo_vote
    FROM People p LEFT JOIN Keys USING (email)`

function mailTask(type, data, options = { searchKeys: [] }) {
  return fetch('http://kyyhky:3000/job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data, options })
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
      return mailTask('update-recipients', recipients).then(() => emails.length)
    })
    .then(count => res.json({ success: true, count }))
    .catch(next)
}

function updateMailRecipient(db, email) {
  return db.any(`${mailRecipient.selector} WHERE email ILIKE $1`, email)
    .then(res => mailTask('update-recipients', [mailRecipient(email, res)]))
    .catch(err => console.error('updateMailRecipient:', err))
}
