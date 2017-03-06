import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { IndexRedirect, Router, Route, browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createStore } from 'redux'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

import './lib/polyfills'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import { keyLogin, tryLogin } from './app/actions/auth'
import { PATH_IN, PATH_OUT } from './constants'
import App from './app/components/App'
import Login from './app/components/Login'
import MemberList from './kansa/components/MemberList'
import NewMemberForm from './kansa/components/NewMemberForm'
import NewMemberIndex from './kansa/components/NewMemberIndex'
import ExhibitReg from './raami/components/Exhibition'
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

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-66635432-3', 'auto');
history.listen(({ pathname }) => {
  if (pathname.indexOf('/login') !== -1) pathname = '/login';
  ga('set', 'page', pathname);
  ga('send', 'pageview');
});

function checkAuth(nextState, replace, callback) {
  const email = store.getState().user.get('email');
  if (email) callback();
  else store.dispatch(tryLogin(() => callback()));
}

function requireAuth({ location: { pathname }}, replace) {
  const email = store.getState().user.get('email');
  if (!email && pathname !== PATH_OUT) replace(PATH_OUT);
}

function doLogin({ params: { email, key, id } }) {
  store.dispatch(keyLogin(email, key, id ? `/hugo/${id}` : null));
}

ReactDOM.render(
  <Provider store={store} >
    <MuiThemeProvider muiTheme={theme}>
      <Router history={syncHistoryWithStore(history, store)}>
        <Route path="/login/:email/:key" onEnter={doLogin} />
        <Route path="/login/:email/:key/:id" onEnter={doLogin} />
        <Route path="/" component={App} onEnter={checkAuth} >
          <IndexRedirect to={PATH_IN} />
          <Route path="login" component={Login} />
          <Route path="new" component={NewMemberIndex} />
          <Route path="new/:membership" component={NewMemberForm} />
          <Route onEnter={requireAuth}>
            <Route path="profile" component={MemberList} />
            <Route path="exhibition/:id" component={ExhibitReg} />
            <Route path="hugo" >
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
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
