import { fromJS, List } from 'immutable'

export default function (state = List(), action) {
  if (action.error) return state
  switch (action.type) {
    case 'INIT PAYMENTS':
      if (!Array.isArray(action.data)) {
        console.warn(`${action.type} expects array data (got ${typeof action.data})`, action.data)
        return state
      }
      return fromJS(action.data)

    case 'SET PAYMENT':
      const id = parseInt(action.data.id)
      if (isNaN(id) || id < 0) {
        console.warn(`${action.type} expects positive integer id`, action.data)
        return state
      }
      const idx = state.find(payment => payment.get('id') === id)
      const payment = fromJS(action.data)
      return isNaN(idx) ? state.push(payment) : state.set(idx, payment)

    case 'LOGOUT':
      return List()
  }
  return state
}
