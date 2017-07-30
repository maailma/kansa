import { Map } from 'immutable'

const defaultState = Map({
  locked: false,
  password: '',
  printer: ''
})

export default function (state = defaultState, action) {
  if (action.error) return state
  switch (action.type) {
    case 'SET REG LOCK':
      return state.set('locked', !!action.locked)

    case 'SET REG OPTIONS':
      const { password, printer } = action
      return state.merge({ password, printer })
  }
  return state
}
