import { fromJS, List, Map } from 'immutable';

export default function(state = fromJS([1,2,3]), action) {
  return state.push(4);
}
