import { fromJS, List, Map } from 'immutable'


const defaultState = Map({
  ballots: Map(),  // { [category]: { [id: number]: nomination[] } }
  canon: Map(),
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

    case 'FETCH_ALL_BALLOTS':
      return state.set('ballots', Map(Object.keys(action.data).map(
        category => [ category, Map(action.data[category].map(
          ([ id, nominations ]) => ([ id, fromJS(nominations) ])
        )) ]
      )));

    case 'FETCH_BALLOTS':
      return state.setIn(['ballots', category], Map(action.data.map(
        ([ id, nominations ]) => ([ id, fromJS(nominations) ])
      )));

    case 'SET_CANON':
      return state.set('canon', Map(Object.keys(action.canon).map(
        category => [ category, Map(action.canon[category].map(
          ([ id, nomination ]) => ([ id, fromJS(nomination) ])
        )) ]
      )));

    case 'SET_NOMINATIONS':
      return state.set('nominations', Map(Object.keys(action.nominations).map(
        category => [ category, List(action.nominations[category].map(
          ([ data, canon_id ]) => fromJS({ canon_id, category, data })
        )) ]
      )));

  }
  return state;
}
