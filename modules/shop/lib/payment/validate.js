module.exports = { validateParameters, validateItem }

function validateParameters(email, source, items) {
  if (!email) {
    return 'A valid email is required'
  }
  if (source && !source.id) {
    return 'A valid source is required'
  }
  if (!items || items.length === 0) {
    return 'At least one item is required'
  }
  const currency = items[0].currency
  for (let i = 0; i < items.length; ++i) {
    const item = items[i]
    if (item.id) continue
    if (!item.amount || !item.currency || !item.category || !item.type) {
      return 'Required parameters: amount, currency, category, type'
    }
    if (item.currency !== currency) {
      return 'Currencies of all items must match!'
    }
    if (!item.person_id && !item.payment_email) {
      return 'Either person_id or email is required'
    }
    if (
      item.status === 'invoice' &&
      (item.stripe_charge_id || item.stripe_receipt || item.stripe_token)
    ) {
      return 'Invoice items cannot have associated payment data'
    }
  }
  return null
}

function checkItemData(shape, data) {
  const missing = shape
    .filter(s => s.required && !data[s.key] && data[s.key] !== false)
    .map(s => s.key)
  const badType = shape
    .filter(({ key, type, values }) => {
      if (missing.indexOf(key) !== -1) return false
      const tgt = data[key]
      if (!tgt) return false
      return (
        (type && typeof tgt !== type) ||
        (values && Object.keys(values).every(value => tgt !== value))
      )
    })
    .map(s => s.key)
  return missing.length || badType.length ? { missing, badType } : null
}

function validateItem(item, categories) {
  const cd = categories[item.category]
  if (!cd) return 'Unknown payment category: ' + JSON.stringify(item.category)
  if (cd.types && cd.types.every(({ key }) => item.type !== key)) {
    const ts = JSON.stringify(item.type)
    return `Unknown type ${ts} for payment category ${item.category}`
  }
  const dataErrors = checkItemData(cd.shape || [], item.data)
  if (dataErrors) return 'Bad data: ' + JSON.stringify(dataErrors)
  return null
}
