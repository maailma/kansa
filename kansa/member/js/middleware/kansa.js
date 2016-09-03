import { Map } from 'immutable'

import { logout, memberUpdate } from '../actions'

export default (api) => (store) => (next) => (action) => {
  if (!action.error) switch (action.type) {

    case 'LOGOUT':
      api.GET('logout')
        .then(res => next(action))
        .catch(e => console.error(e));  // TODO: report errors better
      break;

    case 'MEMBER_UPDATE':
      const { id, changes } = action;
      if (!id || !Map.isMap(changes) || changes.isEmpty()) {
        throw new Error(`Bad parameters for member update: ${JSON.stringify(action)}`);
      }
      api.POST(`people/${id}`, changes.toJS())
        .then(res => next(action))
        .catch(e => console.error(e));  // TODO: report errors better
      break;

  }
  return next(action);
}
