import { setServerData, submitVotes } from './actions'
import { API_ROOT } from '../constants'
import API from '../lib/api'
const api = new API(API_ROOT);

const submitDelay = 15 * 1000;
let submitTimeout = null;
let submitBeforeUnload = null;

function handleSubmitVotes(dispatch, { hugoVotes }, atUnload) {
  const id = hugoVotes.get('id');
  const signature = hugoVotes.get('signature');
  if (!id || !signature) {
    return dispatch({ type: 'ERROR', error: new Error('Voting requires id & signature!') });
  }
  const votes = hugoVotes.get('clientVotes').filter((catVotes, category) => (
    catVotes && !catVotes.equals(hugoVotes.getIn(['serverVotes', category]))
  ));
  if (votes.size) {
    const data = { signature, votes: votes.toJS() };
    const path = `hugo/${id}/vote`;
    if (atUnload) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API_ROOT + path, blob);
      } else {  // IE, Safari
        const xhr = new XMLHttpRequest();
        xhr.open('POST', API_ROOT + path, false);
        xhr.send(blob);
      }
    } else {
      api.POST(path, data)
        .then(({ time }) => {
          dispatch(setServerData(votes, new Date(time)));
          if (window.ga) votes.forEach((_, category) => ga('send', 'event', 'Vote', category));
        })
        .catch(error => dispatch({ type: 'ERROR', error}));
    }
  }
}

export default ({ dispatch, getState }) => (next) => (action) => {
  if (action.error || action.module !== 'hugo-votes') return next(action);
  try { switch (action.type) {

    case 'GET_FINALISTS': {
      const finalists = getState().hugoVotes.get('finalists');
      if (!finalists || finalists.size === 0) api.GET('hugo/finalists')
        .then(finalists => next({ ...action, finalists }));
      return;
    }

    case 'SET_VOTER':
      api.GET(`hugo/${action.id}/votes`)
        .then(votes => dispatch(setServerData(votes)));
      break;

    case 'SET_VOTES':
      if (submitTimeout) clearTimeout(submitTimeout);
      submitTimeout = setTimeout(() => dispatch(submitVotes()), submitDelay);
      if (!submitBeforeUnload) {
        submitBeforeUnload = () => handleSubmitVotes(() => {}, getState(), true);
        window.addEventListener('beforeunload', submitBeforeUnload);
      }
      break;

    case 'SUBMIT_VOTES':
      if (submitTimeout) {
        clearTimeout(submitTimeout);
        submitTimeout = null;
      }
      handleSubmitVotes(dispatch, getState());
      break;

  }} catch (error) {
    return next({ ...action, error });
  }

  next(action);
}
