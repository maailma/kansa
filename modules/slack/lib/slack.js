const FormData = require('form-data')
const fetch = require('node-fetch')
const { AuthError, InputError } = require('@kansa/errors')

function sendInvite(org, data) {
  const body = new FormData()
  Object.keys(data).forEach(key => body.append(key, data[key]))
  return fetch(`https://${org}.slack.com/api/users.admin.invite`, {
    method: 'POST',
    body
  })
    .then(res => res.json())
    .then(({ ok, error, needed }) => {
      if (!ok)
        switch (error) {
          case 'already_invited':
          case 'already_in_team':
            throw new InputError(
              'You have already been invited to Slack. Look for an email from ' +
                `"feedback@slack.com" to ${JSON.stringify(
                  data.email
                )} and join us at ` +
                `https://${org}.slack.com/`
            )
          case 'invalid_email':
            throw new InputError(
              `The email address ${JSON.stringify(data.email)} is invalid`
            )
          case 'missing_scope':
            throw new Error(`Slack token missing ${needed} scope!`)
          default:
            throw new Error(`Slack invite error: ${error}`)
        }
    })
}

class Slack {
  constructor(db, { org, require_membership } = {}) {
    this.db = db
    this.org = org
    this.reqMembership = !!require_membership
    this.token = process.env.SLACK_TOKEN
    if (!this.org) throw new Error('The Slack org config value is required')
    if (!this.token) throw new Error('The SLACK_TOKEN env var is required')
    this.invite = this.invite.bind(this)
  }

  getUserData(user) {
    const email = user && user.email
    if (!email) return Promise.reject(new AuthError())
    let select = `
      SELECT public_first_name, public_last_name
      FROM People LEFT JOIN membership_types USING (membership)
      WHERE email = $1`
    if (this.reqMembership) select += ` AND m.member = true`
    return this.db.any(select, email).then(people => {
      if (people.size === 0)
        throw new AuthError('Slack access requires membership')
      const user = { email }
      if (people.size === 1) {
        const { public_first_name, public_last_name } = people[0]
        if (public_first_name) user.first_name = public_first_name
        if (public_last_name) user.last_name = public_last_name
      }
      return user
    })
  }

  invite(req, res, next) {
    return this.getUserData(req.session.user)
      .then(user =>
        sendInvite(this.org, Object.assign({ token: this.token }, user)).then(
          () => res.json({ success: true, email: user.email })
        )
      )
      .catch(next)
  }
}

module.exports = Slack
