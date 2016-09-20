import { setCanon, setNominations } from './actions'
import { API_ROOT } from '../constants'

import API from '../lib/api'
const api = new API(API_ROOT);

export default ({ dispatch, getState }) => (next) => (action) => {
  if (action.error || action.module !== 'hugo-admin') return next(action);
  const handleError = (src) => (error) => dispatch({ ...src(), error });
  switch (action.type) {

    case 'INIT_HUGO_ADMIN':
      api.GET(`hugo/canon/canon`)
        .then(canon => dispatch(setCanon(null, canon)))
        .catch(handleError(setCanon));
      api.GET(`hugo/canon/nominations`)
        .then(nominations => dispatch(setNominations(null, nominations)))
        .catch(handleError(setNominations));
      break;

  }
  next(action);
}
