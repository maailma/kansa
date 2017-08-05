import { Map } from 'immutable'

const defaultState = Map({
  message: ''
})

export default function (state = defaultState, action) {
  if (action.error) {
    console.error(action.error)
    const message = action.error.message || action.error.status || action.error
    return state.set('message', `${action.type} error` + (message ? `: ${message}` : ''))
  } else if (action.type === 'SET MESSAGE') {
    console.log(action.message)
    return state.set('message', action.message || '')
  } else {
    return state
  }
}
