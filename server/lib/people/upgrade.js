const { InputError } = require('@kansa/common/errors')
const LogEntry = require('@kansa/common/log-entry')
const { updateMailRecipient } = require('@kansa/common/mail')
const Person = require('./person')

module.exports = upgradePerson

function upgradePaperPubs(req, db, data) {
  if (!data.paper_pubs) throw new InputError('No valid parameters')
  return db.tx(async tx => {
    const row = await tx.oneOrNone(
      `UPDATE People p SET paper_pubs=$(paper_pubs)
      FROM membership_types m
      WHERE id=$(id) AND m.membership = p.membership AND m.member = true
      RETURNING member_number`,
      data
    )
    if (!row) {
      const err = new Error('Paper publications are only available for members')
      err.status = 402
      throw err
    }
    await new LogEntry(req, 'Add paper pubs').write(tx)
    const { member_number } = row
    return { member_number, updated: ['paper_pubs'] }
  })
}

function getUpgradeQuery(data, addMemberNumber) {
  const fields = ['membership']
  let update = 'membership=$(membership)'
  if (addMemberNumber) {
    fields.push('member_number')
    update += ", member_number=nextval('member_number_seq')"
  }
  if (data.paper_pubs) {
    fields.push('paper_pubs')
    update += ', paper_pubs=$(paper_pubs)'
  }
  const query = `
    UPDATE people SET ${update} WHERE id=$(id)
    RETURNING email, member_number`
  return { fields, query }
}

function upgradeMembership(req, db, data) {
  return db.tx(async tx => {
    const priceRows = await tx.any(`SELECT * FROM membership_prices`)
    const prev = await tx.one(
      `SELECT membership, member_number FROM People WHERE id=$1`,
      data.id
    )
    const nextPrice = priceRows.find(p => p.membership === data.membership)
    if (!nextPrice) {
      const strType = JSON.stringify(data.membership)
      throw new InputError(`Invalid membership type: ${strType}`)
    }
    const prevPrice = priceRows.find(p => p.membership === prev.membership)
    if (prevPrice && prevPrice.amount > nextPrice.amount) {
      throw new InputError(
        `Can't upgrade from ${prev.membership} to ${data.membership}`
      )
    }
    const addMemberNumber = !parseInt(prev.member_number)
    const { fields, query } = getUpgradeQuery(data, addMemberNumber)
    const { email, member_number } = await tx.one(query, data)
    const log = new LogEntry(req, `Upgrade to ${data.membership}`)
    if (data.paper_pubs) log.description += ' and add paper pubs'
    log.subject = data.id
    await log.write(tx)
    updateMailRecipient(db, email)
    return { member_number, updated: fields }
  })
}

function upgradePerson(req, db, data) {
  if (data.hasOwnProperty('paper_pubs')) {
    try {
      data.paper_pubs = Person.cleanPaperPubs(data.paper_pubs)
    } catch (err) {
      return Promise.reject(err)
    }
  }
  return data.membership
    ? upgradeMembership(req, db, data)
    : upgradePaperPubs(req, db, data)
}
