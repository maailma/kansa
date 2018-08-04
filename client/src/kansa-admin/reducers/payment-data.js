import { fromJS, Map } from 'immutable'

export default function(state = Map(), action) {
  return action.error
    ? state
    : action.type === 'SET PAYMENT DATA'
      ? fromJS(action.data)
      : state
}
