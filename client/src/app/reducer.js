import { Map } from 'immutable'

const defaultState = Map({
  message: '',
  person: -1,
  title: TITLE
});

export default function(state = defaultState, action) {
  if (action.error) {
    const message = action.error.message || action.error.status;
    return state.set('message', `${action.type} error` + (message ? `: ${message}` : ''));
  }
  switch (action.type) {

    case 'SET_PERSON':
      return state.set('person', action.person);

    case 'SET_TITLE':
      return state.set('title', action.title);

    case 'SHOW_MESSAGE':
      return state.set('message', action.message);

    case 'HIDE_MESSAGE':
      return state.set('message', '');

  }
  return state;
}
