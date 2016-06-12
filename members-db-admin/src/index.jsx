import React from 'react';
import { render } from 'react-dom';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';

//import 'styles/app.scss';
//import 'bootstrap/dist/css/bootstrap.css';

import App from './components/App';
import people from './reducers/people';

const reducer = combineReducers({ people });

render(
  <Provider store={createStore(reducer)}>
    <App />
  </Provider>,
  document.getElementById('app')
);
