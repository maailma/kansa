import { fromJS, List, Map } from 'immutable'

import { categories } from '../hugo/constants'


const defaultState = Map({
  canon: Map(),
  category: 'Novel',
  error: null,
  nominations: Map()
})

export default (state = defaultState, action) => {
  const { category, error, module, type } = action;
  if (error || module !== 'hugo-admin') return state;
  switch (type) {

    case 'SET_CANON':
      return state.set('canon', Map(Object.keys(action.canon).map(
        category => [ category, Map(action.canon[category].map(
          ([ id, nomination ]) => ([ id, fromJS(nomination) ])
        )) ]
      )));

    case 'SET_CATEGORY':
      const category = action.category;
      return categories.indexOf(category) >= 0
        ? state.set('category', category)
        : state.set('error', JSON.stringify(category) + ' is not a valid category' );

    case 'SET_NOMINATIONS':
      return state.set('nominations', Map(Object.keys(action.nominations).map(
        category => [ category, List(action.nominations[category].map(
          ([ nomination, canon_id ]) => Map({ ...nomination, canon_id })
        )) ]
      )));

  }
  return state;
}
