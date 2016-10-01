import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { IndexRoute, Router, Route, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createStore } from 'redux'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import { keyLogin, tryLogin } from './app/actions/auth'
import { PATH_OUT } from './constants'
import App from './app/components/App'
import KeyRequest from './app/components/KeyRequest'
import Nominate from './hugo/components/Nominate'
import middleware from './middleware'
import reducers from './reducers'

import './app/style.css'

const store = createStore(reducers, middleware(hashHistory));

const authCheck = (_, replace, callback) => {
  const email = store.getState().user.get('email');
  if (email) callback();
  else store.dispatch(tryLogin(err => {
    if (err) replace(PATH_OUT);
    callback();
  }));
}

const doLogin = ({ params: { email, key } }) => {
  store.dispatch(keyLogin(email, key));
}

ReactDOM.render(
  <Provider store={store} >
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Router history={syncHistoryWithStore(hashHistory, store)}>
        <Route path="/" component={App} >
          <IndexRoute onEnter={authCheck} component={Nominate} />
          <Route path="participate" component={KeyRequest} />
          <Route path="login/:email/:key" onEnter={doLogin} />
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
