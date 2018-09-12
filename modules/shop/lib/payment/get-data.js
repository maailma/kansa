module.exports = { getCategoryData, getItemData, getEmailData }

function getCategoryData(db, items) {
  const cc = items.map(it => it.category).filter(c => c)
  if (cc.length === 0) return Promise.resolve([])
  return db
    .any(
      `SELECT
        key, c.allow_create_account, c.custom_email, f.fields AS shape, t.types
      FROM payment_categories c
        LEFT JOIN payment_fields_by_category f USING (key)
        LEFT JOIN payment_types_by_category t USING (key)
      WHERE key IN ($1:csv)`,
      [cc]
    )
    .then(rows => rows.reduce((cd, c) => ({ ...cd, [c.key]: c }), {}))
}

function getItemData(db, items) {
  const itemIds = items.map(it => it.id).filter(id => id)
  if (itemIds.length === 0) return Promise.resolve([])
  return db.many(
    `SELECT
      a.id, a.status, a.amount, a.currency, a.person_id,
      a.category, a.type, a.data, a.invoice,
      p.email AS person_email, preferred_name(p) AS person_name,
      c.allow_create_account, c.custom_email, t.label AS type_label
    FROM Payments a
      LEFT JOIN People p ON (a.person_id = p.id)
      LEFT JOIN payment_categories c ON (a.category = c.key)
      LEFT JOIN payment_types t ON (a.type = t.key)
    WHERE a.id in ($1:csv)`,
    [itemIds]
  )
}

function getEmailData(db, items, categories) {
  const ids = []
  items.forEach(it => {
    const id = Number(it.person_id)
    if (id > 0 && !it.person_email && !ids.includes(id)) {
      const cd = categories[it.category] || it
      if (!cd.custom_email) ids.push(id)
    }
  })
  if (ids.length === 0) return Promise.resolve([])
  return db.many(
    `SELECT id, email, preferred_name(p) as name
    FROM People p WHERE id in ($1:csv)`,
    [ids]
  )
}
