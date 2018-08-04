const TITLE_MAX_LENGTH = 14

const splitNameInTwain = name => {
  name = name.trim()
  if (name.indexOf('\n') !== -1) {
    const nm = name.match(/(.*)\s+([\s\S]*)/)
    const n0 = nm[1].trim()
    const n1 = nm[2].trim().replace(/\s+/g, ' ')
    return [n0, n1]
  } else if (name.length <= TITLE_MAX_LENGTH) {
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

export default function printBadge(server, printer, member) {
  const {
    badge_name,
    badge_subtitle,
    country,
    legal_name,
    member_number,
    membership,
    public_first_name,
    public_last_name
  } = member.toJS()
  const public_name = [public_first_name, public_last_name]
    .filter(n => n)
    .join(' ')
    .trim()
  const [FirstName, Surname] = splitNameInTwain(
    badge_name || public_name || legal_name
  )
  const Info = badge_subtitle || country || ''
  return fetch(server, {
    body: JSON.stringify({
      labeldata: [
        {
          id: String(member_number),
          Class: membership,
          FirstName,
          Surname,
          Info
        }
      ],
      ltype: 'badge',
      printer
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  }).then(response => (response.ok ? response : Promise.reject(response)))
}
