const LogEntry = require('@kansa/common/log-entry')

module.exports = {
  getPerson,
  getPrevNames,
  getPersonLog,
  addPerson
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
