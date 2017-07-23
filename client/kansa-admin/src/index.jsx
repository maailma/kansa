import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { createStore } from 'redux';

// Needed by material-ui for onTouchTap, see http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import 'react-virtualized/styles.css';
import './styles/app.css';

import API from './api';
import App from './components/App';
import { loadRegistrationState } from './components/RegistrationOptions'
import reducers from './reducers'

const store = createStore(reducers, loadRegistrationState());
const api = new API(API_HOST ? `https://${API_HOST}/api/` : '/api/');
api.GET('user')
  .then(data => store.dispatch({ type: 'LOGIN', data }))
  .then(() => api.GET('people'))
  .then(data => store.dispatch({ type: 'INIT PEOPLE', data }))
  .then(() => {
    const wsUri = `wss://${API_HOST || location.host}/api/people/updates`;
    const ws = new ReconnectingWebSocket(wsUri);
    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      store.dispatch({ type: 'SET PERSON', data });
    };
  })
  .then(() => api.GET('purchase/list', { all: 1 }))
  .then(data => store.dispatch({ type: 'INIT PAYMENTS', data }))
  .then(() => api.GET('purchase/data'))
  .then(data => store.dispatch({ type: 'SET PAYMENT DATA', data }))
  .catch(e => console.error(e));

const orange = '#fc7c39';
const lightBlue = '#3da9d4';
const darkBlue = '#005383';
const midGray = '#808080';

const theme = getMuiTheme({
  fontFamily: '"Open Sans", sans-serif',
  card: {
    titleColor: orange,
    subtitleColor: midGray
  },
  palette: {
    primary1Color: lightBlue,
    primary2Color: darkBlue,
    accent1Color: orange,
    disabledColor: midGray
  },
  tabs: {
    backgroundColor: 'transparent',
    selectedTextColor: 'rgba(0,0,0,0.6)',
    textColor: 'rgba(0,0,0,0.4)'
  },
  textField: {
    errorColor: orange
  }
});

render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={theme}>
      <App api={api} title={TITLE} />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('app')
);
