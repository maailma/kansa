import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

// Needed by material-ui for onTouchTap, see http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import 'react-virtualized/styles.css';
import './styles/app.css';

import API from './api';
import App from './components/App';
import people from './reducers/people';
import user from './reducers/user';

const store = createStore(combineReducers({ people, user }));
const api = new API(`http://${process.env.KANSA_API_HOST}/`);
api.GET('user')
  .then(data => store.dispatch({ type: 'LOGIN', data }))
  .then(() => api.GET('people'))
  .then(data => store.dispatch({ type: 'INIT PEOPLE', data }))
  .then(() => {
    const ws = new WebSocket(`ws://${process.env.KANSA_API_HOST}/people/updates`);
    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      store.dispatch({ type: 'SET PERSON', data });
    };
    ws.onclose = ev => console.warn('WebSocket closed', ev);
    ws.onerror = ev => console.error('WebSocket error!', ws, ev);
  })
  .catch(e => console.error(e));

render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <App api={api} title={process.env.KANSA_TITLE} />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('app')
);
