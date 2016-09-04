import { fromJS, Map } from 'immutable';

export default function(state = Map(), action) {
  if (action.error) return state;
  switch (action.type) {

    case 'SET PERSON':
      const map = action.person && typeof action.person == 'object' && fromJS(action.person);
      if (!Map.isMap(map)) throw new Error(`${action.type} action failed: Expected an object, but instead got: ${JSON.stringify(action.person)}`);
      return map;

  }
  return state;
}

