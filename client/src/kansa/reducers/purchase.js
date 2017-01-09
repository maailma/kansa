import { fromJS, Map } from 'immutable';

export default function(state = Map(), action) {
  if (action.error || action.module !== 'kansa') return state;
  switch (action.type) {

    case 'GET_PRICES':
      const { prices } = action;
      return state.set('prices', fromJS(prices));

  }
  return state;
}
