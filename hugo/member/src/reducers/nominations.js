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
import { combineReducers } from 'redux'

import { categories } from '../hugoinfo'

const defaultState = Map({
  clientData: List(),
  serverData: List(),
  serverTime: null,
  isFetching: false,
  error: null
});

const reducer = (category) => (state = defaultState, action) => {
  if (action.category !== category || action.stage !== 'nomination') return state;
  if (action.error) return state.set('isFetching', false).set('error', action.error);
  switch (action.type) {

    case 'SET':
      const serverData = fromJS(action.nominations);
      const serverTime = action.time;
      if (!List.isList(serverData)) {
        const err = `Server error for ${category}: Expected an array of nominations, but instead got: ${JSON.stringify(action.nominations)}`;
        return state.set('isFetching', false).set('error', err);
      }
      return Map({
        clientData: serverData,
        serverData,
        serverTime,
        isFetching: false,
        error: null
      });

    case 'SUBMIT':
      return state.set('isFetching', true).set('error', null);

    case 'EDIT':
      try {
        if (state.get('isFetching')) {
          throw new Error('Nominations cannot be updated while submitting data');
        }
        const idx = action.index;
        const nomination = action.nomination ? fromJS(action.nomination) : null;
        if (!isFinite(idx) || idx < 0 || Math.floor(idx) !== idx) {
          throw new Error(`${JSON.stringify(idx)} is not a valid index`);
        }
        if (nomination && !Map.isMap(nomination)) {
          throw new Error(`${JSON.stringify(action.nomination)} is not a valid nomination object`);
        }
        return state.setIn(['clientData', idx], nomination);
      } catch (e) {
        return state.set('error', `Editing ${category} nomination failed: ${e.message}`);
      }

  }
  return state;
}


export default combineReducers(categories.reduce((reducers, category) => {
  const name = category.charAt(0).toLowerCase() + category.slice(1);
  reducers[name] = reducer(category);
  return reducers;
}, {}));
