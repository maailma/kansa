module.exports = {
  getDaypassPrices,
  getPurchaseData,
  getPurchases,
  getStripeKeys
}

function getDaypassPrices(db) {
  return db.many(`SELECT * FROM daypass_amounts`).then(amounts =>
    amounts.reduce((map, row) => {
      map[row.status] = Object.assign(row, { status: undefined })
      return map
    }, {})
  )
}

function getPurchaseData(db) {
  return db
    .many(
      `SELECT
      c.key, c.label, c.account, c.allow_create_account,
      c.listed, c.description, f.fields AS shape, t.types
    FROM payment_categories c
      LEFT JOIN payment_fields_by_category f USING (key)
      LEFT JOIN payment_types_by_category t USING (key)`
    )
    .then(rows =>
      rows.reduce((data, row) => {
        data[row.key] = row
        delete row.key
        Object.keys(row)
          .filter(key => row[key] == null)
          .forEach(key => {
            delete row[key]
          })
        return data
      }, {})
    )
}

function getStripeKeys(db, name) {
  const type = process.env[name].startsWith('sk_live') ? 'pk_live' : 'pk_test'
  return db
    .any(`SELECT name, key FROM stripe_keys WHERE type = $1`, type)
    .then(data =>
      data.reduce((keys, { name, key }) => {
        keys[name] = key
        return keys
      }, {})
    )
}

function getPurchases(db, email) {
  let select = `SELECT * FROM Payments`
  if (email)
    select += ` WHERE payment_email=$1 OR person_id IN
      (SELECT id FROM People WHERE email=$1)`
  return db.any(select, email)
}
