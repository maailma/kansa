const { InputError } = require('@kansa/common/errors')

module.exports = lookupPerson

function getLookupQuery({ email, member_number, name }) {
  const parts = []
  const values = {}
  if (email && /.@./.test(email)) {
    parts.push('lower(email) = $(email)')
    values.email = email.trim().toLowerCase()
  }
  if (member_number > 0) {
    parts.push('(member_number = $(number) OR id = $(number))')
    values.number = Number(member_number)
  }
  if (name) {
    parts.push(
      '(lower(legal_name) = $(name) OR lower(public_name(p)) = $(name))'
    )
    values.name = name.trim().toLowerCase()
  }
  const query = `
    SELECT id, membership, preferred_name(p) AS name
    FROM people p
      LEFT JOIN membership_types m USING (membership)
    WHERE ${parts.join(' AND ')} AND
      m.allow_lookup = true`
  return { parts, query, values }
}

/**
 * Look up data on a member based on their name, email address and/or member number
 *
 * @param {Database} db
 * @param {string} [data.email]
 * @param {number} [data.member_number]
 * @param {string} [data.name]
 * @returns {Promise}
 *  Resolves to an object with a status, and on success also id, membership & name fields
 */
function lookupPerson(db, data) {
  const { parts, query, values } = getLookupQuery(data)
  if (parts.length === 0 || (parts.length === 1 && values.number)) {
    return Promise.reject(new InputError('No valid parameters'))
  }
  return db.any(query, values).then(results => {
    switch (results.length) {
      case 0:
        return { status: 'not found' }
      case 1:
        return Object.assign({ status: 'success' }, results[0])
      default:
        return { status: 'multiple' }
    }
  })
}
