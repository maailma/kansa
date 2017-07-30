import { Map } from 'immutable'

export const filterTerms = [
  [ '_some terms_', 'Match both _some_ and _terms_, possibly in different fields' ],
  [ '"_some terms_"', 'Match _some terms_ in one field' ],
  [ '_some -terms_', 'Match _some_, excluding members that match _terms_' ],
  [ 'has:_field_', 'Match members with a non-empty value for the given _field_' ],
  [ 'is:public', 'Match members with some public name' ],
  [ 'is:_membership_', 'Match members of the given _membership_ type' ],
  [ 'loc:_some_', 'Match _some_ in location fields only' ],
  [ 'name:_terms_', 'Match _terms_ in name fields only' ],
  [ '_field_:"_some terms_"', 'Match _some terms_ in the given _field_ only' ]
]

const namePaths = [ ['legal_name'], ['public_first_name'], ['public_last_name'], ['paper_pubs', 'name'] ]
const locPaths = [ ['country'], ['state'], ['city'], ['paper_pubs', 'address'], ['paper_pubs', 'country'] ]

function getMemberFilter (filter) {
  const mapHasValue = (map, cmp) => map.valueSeq().some(value => {
    if (Map.isMap(value)) return mapHasValue(value, cmp)
    if (!value) return false
    if (value == cmp) return true
    if (typeof value !== 'string') return false
    return (value.indexOf(cmp) > -1 || value.toLowerCase().indexOf(cmp) > -1)
  })

  if (!filter || filter.length === 0) return () => true
  return (member) => {
    if (!Map.isMap(member)) return false
    const getStringValue = path => member.getIn(path, '').toString().toLowerCase()

    let names = null
    let locs = null
    const compare = (key, cmp) => {
      switch (key) {
        case '*':
          return mapHasValue(member, cmp)
        case 'name':
          if (!names) names = namePaths.map(getStringValue)
          return names.some(name => name.indexOf(cmp) > -1)
        case 'loc':
          if (!locs) locs = locPaths.map(getStringValue)
          return locs.some(loc => loc.indexOf(cmp) > -1)
        case 'has':
          return member.has(cmp)
        case 'is':
          if (cmp === 'public') return member.has('public_first_name') || member.has('public_last_name')
          return member.get('membership', '').toLowerCase().indexOf(cmp) > -1
        default:
          const value = member.get(key, null)
          return value !== null && String(value).toLowerCase().indexOf(cmp) > -1
      }
    }

    return filter.every(([neg, key, cmp]) => {
      const match = compare(key, cmp)
      return neg ? !match : match
    })
  }
}

function parseFilter (src) {
  const tokener = /(-)?(?:(\w+):)?("([^"]*)(?:"|$)|\S+)/g
  const res = []
  let token
  while (token = tokener.exec(src)) {
    const neg = !!token[1]
    const key = token[2] || '*'
    const cmp = token[4] || token[3]
    res.push([neg, key.toLowerCase(), cmp.toLowerCase()])
  }
  return res
}

const cache = {}

export default function filterPeople (people, filterSrc) {
  const filter = cache[filterSrc] || (src => cache[src] = parseFilter(src))(filterSrc)
  if (filter.length === 0) return people
  return people.filter(getMemberFilter(filter))
}
