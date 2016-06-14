import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

//import 'styles/app.scss';
//import 'bootstrap/dist/css/bootstrap.css';

import API from './api';
import App from './components/App';
import people from './reducers/people';
import user from './reducers/user';

const api = new API('http://localhost:3000/');
const reducer = combineReducers({ people, user });
const store = createStore(reducer);

api.GET('user')
  .then(response => response.json())
  .then(data => store.dispatch({ type: 'LOGIN', data }))
  .catch(e => console.error(e));

api.GET('people')
  .then(response => response.json())
  .then(data => store.dispatch({ type: 'INIT PEOPLE', data }))
  .catch(e => console.error(e));

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
