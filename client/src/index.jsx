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
import Canon from './hugo-admin/components/Canon'
import Finalists from './hugo-admin/components/Finalists'
import HugoAdmin from './hugo-admin/components/HugoAdmin'
import middleware from './middleware'
import reducers from './reducers'

import './app/style.css'
const theme = getMuiTheme({
  fontFamily: '"Open Sans", sans-serif'
});

const history = ENV === 'production' ? browserHistory : hashHistory;
const store = createStore(reducers, middleware(history));

const authCheck = ({ location: { pathname }}, replace, callback) => {
  const email = store.getState().user.get('email');
  if (email) callback();
  else store.dispatch(tryLogin(err => {
    if (err && pathname !== PATH_OUT) replace(PATH_OUT);
    callback();
  }));
}

const doLogin = ({ params: { email, key, id } }) => {
  store.dispatch(keyLogin(email, key, id ? `/hugo/${id}` : null));
}

ReactDOM.render(
  <Provider store={store} >
    <MuiThemeProvider muiTheme={theme}>
      <Router history={syncHistoryWithStore(history, store)}>
        <Route path="/" component={App} >
          <IndexRedirect to={PATH_IN} />
          <Route path="login" onEnter={authCheck} component={Login} />
          <Route path="login/:email/:key" onEnter={doLogin} />
          <Route path="login/:email/:key/:id" onEnter={doLogin} />
          <Route path="profile" onEnter={authCheck} component={MemberList} />
          <Route path="hugo" onEnter={authCheck} >
            <IndexRedirect to={PATH_IN} />
            <Route path="admin" component={HugoAdmin}>
              <IndexRedirect to='Novel' />
              <Route path=":category">
                <IndexRedirect to='nominations' />
                <Route path="finalists" component={Finalists} />
                <Route path="nominations" component={Canon} />
              </Route>
            </Route>
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
