module.exports = function isTrueish(v) {
  if (!v) return false
  if (typeof v === 'boolean') return v
  const s = String(v)
    .trim()
    .toLowerCase()
  return s !== '' && s !== '0' && s !== 'false' && s !== 'null'
}
