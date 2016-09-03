import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { IndexRedirect, IndexRoute, Router, Route, hashHistory } from 'react-router'
import { routerMiddleware, syncHistoryWithStore } from 'react-router-redux'
import { applyMiddleware, createStore } from 'redux'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import { keyLogin, tryLogin } from './actions'
import { PATH_IN } from './constants'
import Member from './components/Member.jsx'
import LoginForm from './components/LoginForm.jsx'
import kansa from './middleware/kansa'
import reducers from './reducers'

import './styles/app.css'

const store = createStore(reducers, applyMiddleware(
  kansa,
  routerMiddleware(hashHistory)
));

const authCheck = (nextState, replace) => {
  const loc = nextState.location.pathname;
  const email = store.getState().user.get('email');
  if (!email) store.dispatch(tryLogin());
  else if (loc == '/') replace(PATH_IN);
}

const doLogin = ({ params: { email, key } }) => {
  store.dispatch(keyLogin(email, key));
}

ReactDOM.render(
  <Provider store={store} >
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Router history={syncHistoryWithStore(hashHistory, store)}>
        <Route path="/">
          <IndexRoute onEnter={authCheck} />
          <Route path="login" component={LoginForm} />
          <Route path="login/:email/:key" onEnter={doLogin} />
          <Route path="profile" onEnter={authCheck} component={Member} />
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
