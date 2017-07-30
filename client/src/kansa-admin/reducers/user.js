import { List, Map } from 'immutable'

export default function (state = Map(), action) {
  if (action.error) return state
  switch (action.type) {
    case 'LOGIN':
      return Map({
        email: action.data.email,
        people: List((action.data.people || {}).map(p => p.id)),
        member_admin: action.data.roles && action.data.roles.indexOf('member_admin') !== -1,
        member_list: action.data.roles && action.data.roles.indexOf('member_list') !== -1,
        siteselection: action.data.roles && action.data.roles.indexOf('siteselection') !== -1
      })

    case 'LOGOUT':
      return Map()
  }
  return state
}
