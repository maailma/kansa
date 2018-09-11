module.exports = {
  getPerson,
  getPrevNames,
  getPersonLog
}

function getPerson(db, id) {
  return db.one(
    `SELECT DISTINCT ON (p.id)
      p.*, preferred_name(p),
      d.status AS daypass, daypass_days(d),
      b.timestamp AS badge_print_time
    FROM people p
      LEFT JOIN daypasses d ON (p.id = d.person_id)
      LEFT JOIN badge_and_daypass_prints b ON (p.id = b.person)
    WHERE p.id = $1
    ORDER BY p.id, b.timestamp`,
    parseInt(id)
  )
}

function getPrevNames(db, id) {
  return db.any(
    `SELECT DISTINCT ON (h.legal_name)
      h.legal_name AS prev_legal_name,
      h.timestamp AS time_from,
      l.timestamp AS time_to
    FROM past_names h LEFT JOIN log l ON (h.id=l.subject)
    WHERE h.id = $1 AND
      l.timestamp > h.timestamp AND
      l.parameters->>'legal_name' IS NOT NULL AND
      name_match(l.parameters->>'legal_name', h.legal_name) = false
    ORDER BY h.legal_name,l.timestamp`,
    parseInt(id)
  )
}

function getPersonLog(db, id) {
  return db.any('SELECT * FROM Log WHERE subject = $1', parseInt(id))
}
