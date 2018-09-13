const LogEntry = require('@kansa/common/log-entry')
const Person = require('./person')

module.exports = addPerson

function addPerson(db, req, person) {
  try {
    if (!(person instanceof Person)) person = new Person(person)
  } catch (err) {
    return Promise.reject(err)
  }
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
