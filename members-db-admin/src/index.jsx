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

const apiHost = 'localhost:3000';
const api = new API(`http://${apiHost}/`);
const reducer = combineReducers({ people, user });
const store = createStore(reducer);

api.GET('user')
  .then(data => store.dispatch({ type: 'LOGIN', data }))
  .then(() => api.GET('people'))
  .then(data => store.dispatch({ type: 'INIT PEOPLE', data }))
  .then(() => {
    const ws = new WebSocket(`ws://${apiHost}/people`);
    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      store.dispatch({ type: 'SET PERSON', data });
    };
    ws.onclose = ev => console.warn('WebSocket closed', ev);
    ws.onerror = ev => {
      const error = new Error('WebSocket error!');
      error.ws = ws;
      throw error;
    };
  })
  .catch(e => { throw e; });

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
