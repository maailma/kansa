const config = require('@kansa/common/config')
const { InputError } = require('@kansa/common/errors')
const LogEntry = require('@kansa/common/log-entry')
const { sendMail, updateMailRecipient } = require('@kansa/common/mail')
const { setKeyChecked } = require('../key')
const Person = require('./person')

module.exports = {
  getPerson,
  getPrevNames,
  getPersonLog,
  addPerson,
  updatePerson
}

function getPerson(req, res, next) {
  const id = parseInt(req.params.id)
  req.app.locals.db
    .one(
      `
    SELECT DISTINCT ON (p.id)
           p.*, preferred_name(p),
           d.status AS daypass, daypass_days(d),
           b.timestamp AS badge_print_time
      FROM people p
 LEFT JOIN daypasses d ON (p.id = d.person_id)
 LEFT JOIN badge_and_daypass_prints b ON (p.id = b.person)
     WHERE p.id = $1
  ORDER BY p.id, b.timestamp`,
      id
    )
    .then(data => res.json(data))
    .catch(next)
}

function getPrevNames(req, res, next) {
  const id = parseInt(req.params.id)
  req.app.locals.db
    .any(
      `
    SELECT DISTINCT ON (h.legal_name)
           h.legal_name AS prev_legal_name,
           h.timestamp AS time_from,
           l.timestamp AS time_to
      FROM past_names h LEFT JOIN log l ON (h.id=l.subject)
     WHERE h.id = $1 AND
           l.timestamp > h.timestamp AND
           l.parameters->>'legal_name' IS NOT NULL AND
           name_match(l.parameters->>'legal_name', h.legal_name) = false
  ORDER BY h.legal_name,l.timestamp`,
      id
    )
    .then(data => res.json(data))
    .catch(next)
}

function getPersonLog(req, res, next) {
  const id = parseInt(req.params.id)
  req.app.locals.db
    .any('SELECT * FROM Log WHERE subject = $1', id)
    .then(data => res.json(data))
    .catch(next)
}

function addPerson(req, db, person) {
  const passDays = person.passDays
  const status = person.data.membership
  if (passDays.length) {
    person.data.membership = 'NonMember'
    person.data.member_number = null
  }
  return db.tx(async tx => {
    const { id, member_number } = await tx.one(
      `INSERT INTO People ${person.sqlValues} RETURNING id, member_number`,
      person.data
    )
    Object.assign(person.data, { id, member_number })
    const log = new LogEntry(req, 'Add new person')
    log.subject = id
    await log.write(tx)
    if (passDays.length > 0) {
      const pdStr = passDays.join(',')
      const trueDays = passDays.map(d => 'true').join(',')
      await tx.none(
        `INSERT INTO daypasses (person_id,status,${pdStr})
        VALUES ($(id),$(status),${trueDays})`,
        { id, status }
      )
    }
    return { id, member_number }
  })
}

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

function updatePerson(req, res, next) {
  const { fields, ppCond, query, values } = getUpdateQuery(
    req.body,
    parseInt(req.params.id),
    req.session.user.member_admin
  )
  const { db } = req.app.locals
  db.task(ts => {
    ts.tx(async tx => {
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
            updateMailRecipient(db, prev_email)
            if (hugo_nominator || wsfs_member) {
              if (prevKey) {
                key = prevKey.key
              } else {
                key = await setKeyChecked(req, ts, {
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
          res.json({ status: 'success', updated: fields, key_sent })
          updateMailRecipient(db, values.email)
        }
      )
      .catch(next)
  })
}
