import { fromJS, Map } from 'immutable'

import { noAwardEntry } from './constants'

const defaultState = Map({
  clientVotes: Map(),
  finalists: Map(),
  id: null,
  isSaving: false,
  packet: Map(),
  serverTime: null,
  serverVotes: Map(),
  signature: null
})

export default (state = defaultState, action) => {
  if (action.module !== 'hugo-votes') return state
  switch (action.type) {
    case 'GET_FINALISTS':
      return state.set('finalists', Map(
        Object.keys(action.finalists).map(category => {
          const map = action.finalists[category].map(finalist => [finalist.id, Map(finalist)])
          map.push([noAwardEntry.get('id'), noAwardEntry])
          return [category, Map(map)]
        })
      ))

    case 'GET_VOTES':
      return state.set('clientVotes', Map())

    case 'SET_PACKET':
      return state.set('packet', fromJS(action.packet || {}))

    case 'SET_SERVER_DATA': {
      const { time, votes } = action
      return state.mergeDeep({
        isSaving: false,
        serverTime: time || null,
        serverVotes: Map.isMap(votes) ? votes : fromJS(votes)
      })
    }

    case 'SET_VOTER': {
      const { id, signature } = action
      const finalists = state.get('finalists')
      return defaultState.merge({ id: id || null, finalists, signature })
    }

    case 'SET_VOTES':
      return state.mergeIn(['clientVotes'], fromJS(action.votes))

    case 'SUBMIT_VOTES':
      return state.set('isSaving', true)
  }
  return state
}
