const FormData = require('form-data')
const fetch = require('node-fetch')

const { AuthError, InputError } = require('./errors')

module.exports = { invite }

function sendInvite(org, data) {
  const body = new FormData()
  Object.keys(data).forEach(key => body.append(key, data[key]))
  return fetch(`https://${org}.slack.com/api/users.admin.invite`, { method: 'POST', body })
    .then(res => res.json())
    .then(({ ok, error, needed }) => {
      if (!ok) switch (error) {
        case 'already_invited':
        case 'already_in_team':
          throw new InputError(
            'You have already been invited to Slack. Look for an email from ' +
            `"feedback@slack.com" to ${JSON.stringify(data.email)} and join us at ` +
            `https://${org}.slack.com/`
          )
        case 'invalid_email':
          throw new InputError(`The email address ${JSON.stringify(data.email)} is invalid`)
        case 'missing_scope':
          throw new Error(`Slack token missing ${needed} scope!`)
        default:
          throw new Error(`Slack invite error: ${error}`)
      }
    })
}

function getUserData(db, session) {
  const email = session && session.user && session.user.email
  if (!email) return Promise.reject(new AuthError())
  let select = `
    SELECT public_first_name, public_last_name
    FROM People p
      LEFT JOIN membership_types m USING (membership)
    WHERE email = $1`
  if (process.env.SLACK_REQ_MEMBER) select += ` AND m.member_number = true`
  return db.any(select, email).then(people => {
    if (people.size === 0) throw new AuthError('Slack access requires membership')
    const user = { email }
    if (people.size === 1) {
      const { public_first_name, public_last_name } = people[0]
      if (public_first_name) user.first_name = public_first_name
      if (public_last_name) user.last_name = public_last_name
    }
    return user
  })
}

function invite(req, res, next) {
  const org = process.env.SLACK_ORG
  const token = process.env.SLACK_TOKEN
  if (!org || !token) return next(new Error(
    'The SLACK_ORG and SLACK_TOKEN env vars are required'
  ))
  getUserData(req.app.locals.db, req.session)
    .then(user => sendInvite(org, Object.assign({ token }, user))
      .then(() => res.json({ success: true, email: user.email })))
    .catch(next)
}
