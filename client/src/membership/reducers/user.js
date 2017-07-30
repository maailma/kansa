import { fromJS, Map } from 'immutable'

export default function (state = Map(), action) {
  if (action.error) return state
  switch (action.type) {
    case 'LOGOUT':
      return Map()

    case 'MEMBER_SET': {
      const { email, people, roles } = action
      return fromJS({
        email,
        people,
        memberAdmin: roles && roles.indexOf('member_admin') !== -1
      })
    }

    case 'MEMBER_UPDATE': {
      const { id, changes } = action
      const key = state.get('people').findKey(p => p.get('id') === id)
      if (typeof key !== 'number') return state
      return state.mergeIn(['people', key], changes)
    }
  }
  return state
}
