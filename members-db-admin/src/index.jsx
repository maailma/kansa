import React from 'react';
import { render } from 'react-dom';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';

//import 'styles/app.scss';
//import 'bootstrap/dist/css/bootstrap.css';

import App from './components/App';
import people from './reducers/people';
import user from './reducers/user';

const reducer = combineReducers({ people, user });
const store = createStore(reducer);
store.dispatch({
  type: 'LOGIN',
  data: { email: 'user@example.com', people: [2], roles: ['member_admin'] }
});
store.dispatch({
  type: 'INIT PEOPLE',
  data: [
    null,
    { id: '1', email: 'first@example.com', legal_name: 'First user' },
    { id: '2', email: 'user@example.com', legal_name: 'The user' },
    { id: '3', email: 'some@example.com', legal_name: 'Some user' },
    { id: '4', email: 'other@example.com', legal_name: 'Other user' }
  ]
});

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
