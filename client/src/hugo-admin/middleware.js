import { addCanon, addClassification, setCanon, setNominations } from './actions'
import { API_ROOT } from '../constants'

import API from '../lib/api'
const api = new API(API_ROOT);

let ws = null;

export default ({ dispatch, getState }) => (next) => (action) => {
  if (action.error || action.module !== 'hugo-admin') return next(action);
  const handleError = (src) => (error) => dispatch({ ...src, error });
  switch (action.type) {

    case 'CLASSIFY': {
      const { canon, category, nominations } = action;
      const payload = { category, nominations };
      if (canon) switch (typeof canon) {
        case 'number':
          payload.canon_id = canon;
          break;
        case 'string':
          payload.canon_id = Number(canon) || null;
          break;
        case 'object':
          payload.canon_nom = canon.toJS();
          break;
      }
      return api.POST('hugo/admin/classify', payload)
        .then(() => next(action))
        .catch(handleError(action));
    }

    case 'FETCH_ALL_BALLOTS': {
      return api.GET('hugo/admin/ballots')
        .then(data => next({ ...action, data }))
        .catch(handleError(action));
    }

    case 'FETCH_BALLOTS': {
      return api.GET(`hugo/admin/ballots/${action.category}`)
        .then(data => next({ ...action, data }))
        .catch(handleError(action));
    }

    case 'INIT_HUGO_ADMIN': {
      if (!ws) {
        ws = new WebSocket(`wss://${API_HOST || location.host}/api/hugo/admin/canon-updates`);
        ws.onmessage = (msg) => {
          const { canon, classification } = JSON.parse(msg.data);
          if (canon) dispatch(addCanon(canon));
          if (classification) dispatch(addClassification(classification));
        };
        ws.onclose = (event) => {
          dispatch({
            type: 'WebSocket',
            error: { message: `closed (code ${event.code})`, event }
          });
          ws = null;
        }
      }
      api.GET('hugo/admin/canon')
        .then(canon => dispatch(setCanon(null, canon)))
        .catch(handleError(setCanon()));
      api.GET('hugo/admin/nominations')
        .then(nominations => dispatch(setNominations(null, nominations)))
        .catch(handleError(setNominations()));
      break;
    }

    case 'UPDATE_CANON_ENTRY': {
      const { canon_id, category, nomination } = action;
      return api.POST(`hugo/admin/canon/${canon_id}`, { category, nomination })
        .catch(handleError(action));
    }

  }
  next(action);
}
