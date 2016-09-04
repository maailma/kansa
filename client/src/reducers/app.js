import { Map } from 'immutable'

const defaultState = Map({
  message: '',
  showMessage: false
});

export default function(state = defaultState, action) {
  if (action.error) return state.merge({
    message: action.error.message || action.error.status || action.error,
    showMessage: true
  });
  switch (action.type) {

    case 'KEY_REQUEST':
      return state.merge({
        message: 'Login key and link sent to ' + action.email,
        showMessage: true
      });

    case 'SHOW_MESSAGE':
      return state.merge({
        message: action.message,
        showMessage: true
      });

    case 'HIDE_MESSAGE':
      return state.set('showMessage', false);

  }
  return state;
}
