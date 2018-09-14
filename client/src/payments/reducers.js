import { fromJS, Map, OrderedMap } from 'immutable'

const defaultState = Map({
  data: null,
  daypassPrices: null,
  keys: null,
  list: null
})

export default function(state = defaultState, action) {
  if (action.error || action.module !== 'kansa') return state
  switch (action.type) {
    case 'GET_DAYPASS_PRICES':
      return state.set('daypassPrices', fromJS(action.prices))

    case 'GET_PURCHASE_DATA':
      const { data } = action
      Object.keys(data).forEach(category => {
        const cd = data[category]
        cd.types = OrderedMap(
          cd.types ? cd.types.map(td => [td.key, fromJS(td)]) : []
        )
      })
      return state.set('data', fromJS(data))

    case 'GET_PURCHASE_LIST':
      const { list } = action
      return state.set(
        'list',
        fromJS(list)
          .sortBy(p => p.get('updated') || p.get('created'))
          .reverse()
      )

    case 'GET_STRIPE_KEYS':
      const { keys } = action
      return state.set('keys', Map(keys))
  }
  return state
}
