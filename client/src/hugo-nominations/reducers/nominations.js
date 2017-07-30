/* {
        novel: {
            clientData: [
                { author, title, publisher },
                { author, title, publisher },
                ...
            ],
            serverData: [
                { author, title, publisher },
                { author, title, publisher },
                ...
            ],
            serverTime,
            isFetching: [boolean]
        },
        novella: { ... },
        ...
} */

import { fromJS, List, Map } from 'immutable'

import { categoryInfo } from '../constants'

const defaultState = Map(Object.keys(categoryInfo).map(
  category => [category, Map({
    clientData: List(),
    serverData: List(),
    serverTime: null,
    isFetching: false,
    error: null
  })]
))

export default (state = defaultState, action) => {
  if (action.module !== 'hugo-nominations') return state
  const { category, error, type } = action
  // console.log(category, 'STATE', state.get(category).toJS());
  // console.log(category, 'ACTION', action);
  if (!categoryInfo[category]) {
    return (type === 'SET_NOMINATOR') ? defaultState : state
  }
  if (error) return state.mergeIn([category], { isFetching: false, error })
  switch (type) {
    case 'GET_NOMINATIONS':
      const { nominations, time } = action
      const serverData = fromJS(nominations)
      if (!List.isList(serverData)) {
        return state.mergeIn([category], {
          isFetching: false,
          error: `Server error! Expected an array of nominations, but instead got: ${JSON.stringify(nominations)}`
        })
      }
      return state.set(category, Map({
        clientData: serverData,
        serverData,
        serverTime: time,
        isFetching: false,
        error: null
      }))

    case 'EDIT_NOMINATIONS':
      const { index, nomination } = action
      // console.log(category, 'EDIT', index, nomination.toJS());
      try {
        if (state.getIn([category, 'isFetching'])) {
          throw new Error('Nominations cannot be updated while submitting data')
        }
        if (!isFinite(index) || index < 0 || Math.floor(index) !== index) {
          throw new Error(`${JSON.stringify(index)} is not a valid index`)
        }
        if (nomination && !Map.isMap(nomination)) {
          throw new Error(`${JSON.stringify(nomination)} is not a valid nomination object`)
        }
        const cleanNomination = nomination && nomination.filter(value => value)
        return cleanNomination && cleanNomination.size
          ? state.setIn([category, 'clientData', index], cleanNomination)
          : state.deleteIn([category, 'clientData', index])
      } catch (e) {
        return state.setIn([category, 'error'], `Editing nomination failed! ${e.message}`)
      }

    case 'RESET_NOMINATIONS':
      return state.mergeIn([category], {
        clientData: state.getIn([category, 'serverData']),
        isFetching: false,
        error: null
      })

    case 'CLEAR_NOMINATIONS_ERROR':
      return state.setIn([category, 'error'], null)

    case 'SUBMIT_NOMINATIONS':
      return state.mergeIn([category], {
        isFetching: true,
        error: null
      })
  }
  return state
}
