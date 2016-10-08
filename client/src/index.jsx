import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { IndexRedirect, Router, Route, browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createStore } from 'redux'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import { keyLogin, tryLogin } from './app/actions/auth'
import { PATH_IN, PATH_OUT } from './constants'
import App from './app/components/App'
import Login from './app/components/Login'
import MemberList from './kansa/components/MemberList'
import Nominate from './hugo/components/Nominate'
import middleware from './middleware'
import reducers from './reducers'

import './app/style.css'

const history = process.env.NODE_ENV === 'production' ? browserHistory : hashHistory;
const store = createStore(reducers, middleware(history));

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
      <Router history={syncHistoryWithStore(history, store)}>
        <Route path="/" component={App} >
          <IndexRedirect to={PATH_IN} />
          <Route path="login" component={Login} />
          <Route path="login/:email/:key" onEnter={doLogin} />
          <Route path="profile" onEnter={authCheck} component={MemberList} />
          <Route path="hugo" onEnter={authCheck} >
            <IndexRedirect to={PATH_IN} />
            <Route path=":id">
              <IndexRedirect to="nominate" />
              <Route path="nominate" component={Nominate} />
            </Route>
          </Route>
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
