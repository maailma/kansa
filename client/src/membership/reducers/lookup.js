import { fromJS, Map } from 'immutable'

export default function (state = Map(), action) {
  if (action.error) return state
  switch (action.type) {
    case 'MEMBER_LOOKUP': {
      const { query, results } = action
      return state.set(query, fromJS(results))
    }
  }
  return state
}
