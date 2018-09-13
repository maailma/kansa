const TITLE_MAX_LENGTH = 14

module.exports = splitName

function splitName(name, maxLength = TITLE_MAX_LENGTH) {
  name = name.trim()
  if (name.indexOf('\n') !== -1) {
    const nm = name.match(/(.*)\s+([\s\S]*)/)
    const n0 = nm[1].trim()
    const n1 = nm[2].trim().replace(/\s+/g, ' ')
    return [n0, n1]
  } else if (name.length <= maxLength) {
    return ['', name]
  } else {
    const na = name.split(/\s+/)
    let n0 = na.shift() || ''
    let n1 = na.pop() || ''
    while (na.length) {
      const p0 = na.shift()
      const p1 = na.pop()
      if (p1 && n0.length + p0.length > n1.length + p1.length) {
        n1 = p1 + ' ' + n1
        na.unshift(p0)
      } else if (!p1 && n0.length + p0.length > n1.length + p0.length) {
        n1 = p0 + ' ' + n1
      } else {
        n0 = n0 + ' ' + p0
        if (p1) na.push(p1)
      }
    }
    return [n0, n1]
  }
}
