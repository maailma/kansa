const Person = require('./person')

module.exports = {
  getPeople,
  getPeopleSpaced,
  getPeopleQuery,
  getAllPrevNames,
  getMemberEmails,
  getMemberPaperPubs
}

/**
 * List all people
 *
 * @param {Database} db
 * @returns {Promise} Resolves to an array of person objects
 */
function getPeople(db) {
  return db.any(Person.SELECT)
}

/**
 * List all people, with id matching array index
 *
 * Fields with null and false values are filtered out of the response
 *
 * @param {Database} db
 * @returns {Promise} Resolves to an array of nulls and person objects
 */
function getPeopleSpaced(db) {
  return getPeople(db).then(data => {
    const maxId = data.reduce((m, p) => Math.max(m, p.id), -1)
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
    return arr
  })
}

/**
 * List all people matching query
 *
 * The `query` should have keys and their expected values. In addition to all
 * person fields, "since" checks the last-modified date and "name" matches
 * across all name fields.
 *
 * @param {Database} db
 * @param {object} query
 * @returns {Promise} Resolves to an array of person objects
 */
function getPeopleQuery(db, query) {
  const cond = Object.keys(query).map(fn => {
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
  return db.any(`${Person.SELECT} WHERE ${cond.join(' AND ')}`, query)
}

/**
 * List all past legal names
 *
 * Information on when and which each membership was associated with a
 * different legal_name than currently. Near matches are discarded to filter
 * out spelling corrections.
 *
 * @param {Database} db
 * @returns {Promise} Resolves to an array of objects
 */
function getAllPrevNames(db) {
  return db.any(
    `SELECT DISTINCT ON (h.id,h.legal_name)
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
}

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

/**
 * Get all members' email addresses
 *
 * For members sharing an address, the `name` is concatenated.
 *
 * @param {Database} db
 * @returns {Promise} Resolves to an array of { name, email } objects
 */
function getMemberEmails(db) {
  return db
    .any(
      `SELECT
        lower(email) AS email, legal_name AS ln,
        public_first_name AS pfn, public_last_name AS pln
      FROM people p
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
      return Object.keys(namesByEmail).map(email => {
        const name = getCombinedName(namesByEmail[email])
        return { email, name }
      })
    })
}

/**
 * Get all members' paper pubs addresses
 *
 * @param {Database} db
 * @returns {Promise} Resolves to an array of { name, address, country } objects
 */
function getMemberPaperPubs(db) {
  return db.any(
    `SELECT
      paper_pubs->>'name' AS name,
      paper_pubs->>'address' AS address,
      paper_pubs->>'country' AS country
    FROM People p
      LEFT JOIN membership_types m USING (membership)
    WHERE paper_pubs IS NOT NULL AND m.member = true`
  )
}
