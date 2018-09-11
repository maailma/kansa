const config = require('@kansa/common/config')
const { InputError } = require('@kansa/common/errors')
const LogEntry = require('@kansa/common/log-entry')
const { sendMail, updateMailRecipient } = require('@kansa/common/mail')
const setKey = require('../key/set')
const Person = require('./person')

module.exports = updatePerson

function getUpdateQuery(data, id, isAdmin) {
  const values = Object.assign({}, data, { id })
  const fieldSrc = isAdmin ? Person.fields : Person.userModFields
  const fields = fieldSrc.filter(f => values.hasOwnProperty(f))
  if (fields.length == 0) throw new InputError('No valid parameters')
  let ppCond = ''
  if (fields.indexOf('paper_pubs') >= 0) {
    values.paper_pubs = Person.cleanPaperPubs(values.paper_pubs)
    if (config.paid_paper_pubs && !isAdmin) {
      if (!values.paper_pubs)
        throw new InputError('Removing paid paper publications is not allowed')
      ppCond = 'AND paper_pubs IS NOT NULL'
    }
  }
  const query = `
    WITH prev AS (
      SELECT email, m.hugo_nominator, m.wsfs_member
      FROM people p
        LEFT JOIN membership_types m USING (membership)
      WHERE id=$(id)
    )
    UPDATE People p
    SET ${fields.map(f => `${f}=$(${f})`).join(', ')}
    WHERE id=$(id) ${ppCond}
    RETURNING
      email AS next_email,
      preferred_name(p) as name,
      (SELECT email AS prev_email FROM prev),
      (SELECT hugo_nominator FROM prev),
      (SELECT wsfs_member FROM prev)`
  return { fields, ppCond, query, values }
}

function updatePerson(db, req) {
  const { fields, ppCond, query, values } = getUpdateQuery(
    req.body,
    parseInt(req.params.id),
    req.session.user.member_admin
  )
  return db
    .tx(async tx => {
      const data = await tx.oneOrNone(query, values)
      if (!data) {
        if (!ppCond) throw new Error('Update failed')
        const err = new InputError(
          'Paper publications have not been enabled for this person'
        )
        err.status = 402
        throw err
      }
      const log = new LogEntry(req, 'Update fields: ' + fields.join(', '))
      log.subject = values.id
      await log.write(tx)
      if (!values.email) return { data, prevKey: {} }
      const prevKey = await tx.oneOrNone(
        `SELECT key FROM Keys WHERE email=$(email)`,
        values
      )
      return { data, prevKey }
    })
    .then(
      async ({
        data: { hugo_nominator, wsfs_member, next_email, prev_email, name },
        prevKey
      }) => {
        values.email = next_email
        let key = null
        if (next_email !== prev_email) {
          await updateMailRecipient(db, prev_email)
          if (hugo_nominator || wsfs_member) {
            if (prevKey) {
              key = prevKey.key
            } else {
              key = await setKey(req, db, {
                email: values.email
              }).then(({ key }) => key)
            }
          }
        }
        let key_sent = false
        if (key) {
          await sendMail('hugo-update-email', {
            email: values.email,
            key,
            memberId: values.id,
            name
          })
          key_sent = true
        }
        updateMailRecipient(db, values.email)
        return { status: 'success', updated: fields, key_sent }
      }
    )
}
