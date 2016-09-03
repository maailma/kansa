import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRedirect, IndexRoute, Router, Route, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import API from './api.js';
import Auth from './auth.js';
import Member from './components/Member.jsx';
import LoginForm from './components/LoginForm.jsx';
import kansa from './middleware/kansa'
import reducers from './reducers';

import './styles/app.css';

const api = new API(`https://${process.env.KANSA_API_HOST}/api/kansa/`);
const store = createStore(reducers, applyMiddleware(
  kansa(api)
));
const auth = new Auth(api, store);

ReactDOM.render(
  <Provider store={store} >
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Router history={hashHistory}>  
        <Route path="/">
          <IndexRoute onEnter={auth.check} />
          <Route path="login" component={(props) => <LoginForm
            onKeyLogin={auth.keyLogin}
            onKeyRequest={auth.keyRequest}
          />} />
          <Route path="login/:email/:key" onEnter={auth.doLogin} />
          <Route path="profile" onEnter={auth.check} component={Member} />
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
