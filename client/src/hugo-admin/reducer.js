import { fromJS, List, Map } from 'immutable'

import { categoryInfo } from '../hugo/constants'


const defaultState = Map({
  ballots: Map(),  // { [category]: { id: number, nominations: nomination[] }[] }
  canon: Map(),
  category: 'Novel',
  error: null,
  nominations: Map()
})

export default (state = defaultState, action) => {
  const { category, error, module, type } = action;
  if (error || module !== 'hugo-admin') return state;
  switch (type) {

    case 'ADD_CANON':
      return state.setIn(['canon', category, action.id], fromJS(action.nomination));

    case 'ADD_CLASSIFICATION':
      return state.updateIn(['nominations', category], (nominations) => {
        const canon_id = action.canon_id;
        const data = fromJS(action.nomination);
        if (!Map.isMap(data)) return nominations;
        const key = nominations.findKey(nomination => data.equals(nomination.get('data')));
        return typeof key === 'number'
          ? nominations.setIn([key, 'canon_id'], canon_id)
          : nominations.push(Map({ data, canon_id }));
      });

    case 'FETCH_BALLOTS':
      return state.setIn(['ballots', category], fromJS(action.data));

    case 'SET_CANON':
      return state.set('canon', Map(Object.keys(action.canon).map(
        category => [ category, Map(action.canon[category].map(
          ([ id, nomination ]) => ([ id, fromJS(nomination) ])
        )) ]
      )));

    case 'SET_CATEGORY':
      return categoryInfo[category]
        ? state.set('category', category)
        : state.set('error', JSON.stringify(category) + ' is not a valid category' );

    case 'SET_NOMINATIONS':
      return state.set('nominations', Map(Object.keys(action.nominations).map(
        category => [ category, List(action.nominations[category].map(
          ([ data, canon_id ]) => fromJS({ data, canon_id })
        )) ]
      )));

  }
  return state;
}
