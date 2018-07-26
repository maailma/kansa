function paymentDataString(data, shape, ignored) {
  if (!data) return ''
  return Object.keys(data)
    .filter(key => key && data[key] && !ignored[key])
    .map(key => {
      const field = shape && shape.find(s => s.key === key)
      const label = field && field.label || key;
      return `${label}: ${data[key]}`
    })
    .join('\n')
}

module.exports = (data) => {
  data.data = paymentDataString(data.data, data.shape, { mandate_url: true })
  data.strAmount = data.currency.toUpperCase() + ' ' + (data.amount / 100).toFixed(2)
  if (data.type === 'ss-token' && data.status === 'succeeded') {
    return 'kansa-new-siteselection-token'
  }
}
