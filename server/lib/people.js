const { AuthError, InputError } = require('@kansa/errors')
const config = require('./config')
const { setKeyChecked } = require('./key')
const { mailTask, updateMailRecipient } = require('./mail')
const LogEntry = require('./types/logentry')
const Person = require('./types/person')

const selectAllPeopleData = `
  SELECT p.*, preferred_name(p), d.status AS daypass, daypass_days(d)
    FROM people p LEFT JOIN daypasses d ON (p.id = d.person_id)`

module.exports = {
  selectAllPeopleData,
  getMemberEmails,
  getMemberPaperPubs,
  getPeople,
  getPerson,
  getAllPrevNames,
  getPrevNames,
  addPerson,
  authAddPerson,
  updatePerson
}

function getPeopleQuery(req, res, next) {
  const cond = Object.keys(req.query).map(fn => {
    switch (fn) {
      case 'since':
        return 'last_modified > $(since)'
      case 'name':
        return '(legal_name ILIKE $(name) OR public_first_name ILIKE $(name) OR public_last_name ILIKE $(name))'
      case 'member_number':
      case 'membership':
        return `${fn} = $(${fn})`
      default:
        return Person.fields.indexOf(fn) !== -1
          ? `${fn} ILIKE $(${fn})`
          : 'true'
    }
  })
  req.app.locals.db
    .any(`${selectAllPeopleData} WHERE ${cond.join(' AND ')}`, req.query)
    .then(data => res.status(200).json(data))
    .catch(err => next(err))
}

function getMemberEmails(req, res, next) {
  if (!req.session.user.member_admin)
    return res.status(401).json({ status: 'unauthorized' })
  req.app.locals.db
    .any(
      `
    SELECT
      lower(email) AS email, legal_name AS ln,
      public_first_name AS pfn, public_last_name AS pln
    FROM People p
      LEFT JOIN membership_types m USING (membership)
    WHERE email != '' AND m.member = true
    ORDER BY public_last_name, public_first_name, legal_name`
    )
    .then(raw => {
      const namesByEmail = raw.reduce((map, { email, ln, pfn, pln }) => {
        const name =
          [pfn, pln]
            .filter(n => n)
            .join(' ')
            .replace(/  +/g, ' ')
            .trim() || ln.trim()
        if (map[email]) map[email].push(name)
        else map[email] = [name]
        return map
      }, {})
      const getCombinedName = names => {
        switch (names.length) {
          case 0:
            return ''
          case 1:
            return names[0]
          case 2:
            return `${names[0]} and ${names[1]}`
          default:
            names[names.length - 1] = `and ${names[names.length - 1]}`
            return names.join(', ')
        }
      }
      const data = Object.keys(namesByEmail).map(email => {
        const name = getCombinedName(namesByEmail[email])
        return { email, name }
      })
      res.status(200).csv(data, true)
    })
    .catch(next)
}

function getMemberPaperPubs(req, res, next) {
  if (!req.session.user.member_admin)
    return res.status(401).json({ status: 'unauthorized' })
  req.app.locals.db
    .any(
      `
    SELECT
      paper_pubs->>'name' AS name,
      paper_pubs->>'address' AS address,
      paper_pubs->>'country' AS country
    FROM People p
      LEFT JOIN membership_types m USING (membership)
    WHERE paper_pubs IS NOT NULL AND m.member = true`
    )
    .then(data => {
      res.status(200).csv(data, true)
    })
    .catch(next)
}

function getPeople(req, res, next) {
  if (!req.session.user.member_admin && !req.session.user.member_list) {
    return res.status(401).json({ status: 'unauthorized' })
  }
  if (Object.keys(req.query).length > 0) getPeopleQuery(req, res, next)
  else
    req.app.locals.db
      .any(selectAllPeopleData)
      .then(data => {
        const maxId = data.reduce((m, p) => Math.max(m, p.id), -1)
        if (isNaN(maxId)) {
          res.status(500).json({
            status: 'error',
            message: 'Contains non-numeric id?',
            data
          })
        } else {
          const arr = new Array(maxId + 1)
          data.forEach(p => {
            arr[p.id] = Person.fields.reduce(
              (o, fn) => {
                const v = p[fn]
                if (v !== null && v !== false) o[fn] = v
                return o
              },
              { id: p.id }
            )
          })
          res.status(200).json(arr)
        }
      })
      .catch(err => next(err))
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

function getAllPrevNames(req, res, next) {
  const { user } = req.session
  if (!user || (!user.member_admin && !user.member_list))
    return next(new AuthError())
  const csv = req.params.fmt === 'csv'
  req.app.locals.db
    .any(
      `
    SELECT DISTINCT ON (h.id,h.legal_name)
           h.id,
           p.member_number,
           h.legal_name AS prev_name,
           to_char(h.timestamp, 'YYYY-MM-DD') AS date_from,
           to_char(l.timestamp, 'YYYY-MM-DD') AS date_to,
           p.legal_name AS curr_name,
           p.email AS curr_email
      FROM past_names h
           LEFT JOIN log l ON (h.id=l.subject)
           LEFT JOIN people p ON (l.subject=p.id)
     WHERE l.timestamp > h.timestamp AND
           l.parameters->>'legal_name' IS NOT NULL AND
           name_match(l.parameters->>'legal_name', h.legal_name) = false
  ORDER BY h.id,h.legal_name,l.timestamp`
    )
    .then(data => {
      if (csv) res.csv(data, true)
      else res.json(data)
    })
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

function addPerson(req, db, person) {
  const passDays = person.passDays
  const status = person.data.membership
  if (passDays.length) {
    person.data.membership = 'NonMember'
    person.data.member_number = null
  }
  const log = new LogEntry(req, 'Add new person')
  let res
  return db
    .tx(tx =>
      tx
        .one(
          `
      INSERT INTO People ${person.sqlValues}
      RETURNING id, member_number`,
          person.data
        )
        .then(data => {
          person.data.id = data.id
          person.data.member_number = data.member_number
          res = data
          log.subject = data.id
          return tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
        })
        .then(() => {
          if (passDays.length === 0) return null
          const trueDays = passDays.map(d => 'true').join(',')
          return tx.none(
            `
          INSERT INTO daypasses (person_id,status,${passDays.join(',')})
          VALUES ($(id),$(status),${trueDays})`,
            { id: res.id, status }
          )
        })
    )
    .then(() => res)
}

function authAddPerson(req, res, next) {
  if (
    !req.session.user.member_admin ||
    (typeof req.body.member_number !== 'undefined' &&
      !req.session.user.admin_admin)
  ) {
    return res.status(401).json({ status: 'unauthorized' })
  }
  let person
  try {
    person = new Person(req.body)
  } catch (err) {
    return next(err)
  }
  addPerson(req, req.app.locals.db, person)
    .then(({ id, member_number }) =>
      res.status(200).json({ status: 'success', id, member_number })
    )
    .catch(next)
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
  const log = new LogEntry(req, 'Update fields: ' + fields.join(', '))
  log.subject = values.id
  req.app.locals.db.task(dbTask => {
    dbTask
      .tx(tx =>
        tx.batch([
          tx.one(query, values),
          values.email
            ? tx.oneOrNone(`SELECT key FROM Keys WHERE email=$(email)`, values)
            : {},
          tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
        ])
      )
      .then(
        ([
          { hugo_nominator, wsfs_member, next_email, prev_email, name },
          prevKey
        ]) => {
          values.email = next_email
          if (next_email !== prev_email) {
            updateMailRecipient(dbTask, prev_email)
            if (hugo_nominator || wsfs_member) {
              return prevKey
                ? { key: prevKey.key, name }
                : setKeyChecked(req, dbTask, { email: values.email }).then(
                    ({ key }) => ({ key, name })
                  )
            }
          }
          return {}
        }
      )
      .then(
        ({ key, name }) =>
          !!(
            key &&
            mailTask('hugo-update-email', {
              email: values.email,
              key,
              memberId: values.id,
              name
            })
          )
      )
      .then(key_sent => {
        res.json({ status: 'success', updated: fields, key_sent })
        updateMailRecipient(dbTask, values.email)
      })
      .catch(err => {
        if (ppCond && Array.isArray(err) && !err[0].success) {
          const { message } = err.result || {}
          if (message === 'No data returned from the query.') {
            err = new InputError(
              'Paper publications have not been enabled for this person'
            )
            err.status = 402
          }
        }
        next(err)
      })
  })
}
