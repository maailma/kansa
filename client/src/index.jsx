import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { IndexRedirect, IndexRoute, Redirect, Router, Route, browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createStore } from 'redux'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

import './lib/polyfills'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import { keyLogin, tryLogin } from './app/actions/auth'
import App from './app/components/App'
import Index from './app/components/Index'
import NewMemberForm from './membership/components/NewMemberForm'
import NewMemberIndex from './membership/components/NewMemberIndex'
import Upgrade from './membership/components/Upgrade'
import PurchaseIndex from './payments/components/PurchaseIndex'
import PurchaseItem from './payments/components/PurchaseItem'
import Canon from './hugo-admin/components/Canon'
import Nominate from './hugo-nominations/components/Nominate'
import Vote from './hugo-votes'
import Finalists from './hugo-admin/components/Finalists'
import HugoAdmin from './hugo-admin/components/HugoAdmin'
import ExhibitRegistration from './raami/components/Registration'
import middleware from './middleware'
import reducers from './reducers'
import { theme } from './theme'

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
  if (!email && pathname !== '/') replace('/');
}

function doLogin({ location: { query }, params: { email, key, id } }) {
  const next = query && query.next || (id ? `/hugo/vote/${id}` : null);
  store.dispatch(keyLogin(email, key, next));
}

const scrollUpOnChange = (_, { location: { action } }) => {
  if (action !== 'POP') window.scrollTo(0, 0);
}

ReactDOM.render(
  <Provider store={store} >
    <MuiThemeProvider muiTheme={theme}>
      <Router history={syncHistoryWithStore(history, store)}>
        <Route path="/login/:email/:key" onEnter={doLogin} />
        <Route path="/login/:email/:key/:id" onEnter={doLogin} />
        <Route path="/" component={App} onChange={scrollUpOnChange} onEnter={checkAuth} >
          <IndexRoute component={Index} />
          <Redirect from="login" to="/" />
          <Redirect from="profile" to="/" />
          <Route path="new" component={NewMemberIndex} />
          <Route path="new/:membership" component={NewMemberForm} />
          <Route path="hugo" >
            <IndexRedirect to="vote" />
            <Route path="admin" onEnter={requireAuth} component={HugoAdmin}>
              <IndexRedirect to='Novel' />
              <Route path=":category">
                <IndexRedirect to='nominations' />
                <Route path="finalists" component={Finalists} />
                <Route path="nominations" component={Canon} />
              </Route>
            </Route>
            <Route path="nominate/:id" onEnter={requireAuth} component={Nominate} />
            <Route path="vote">
              <IndexRoute component={Vote} />
              <Route path=":id" component={Vote} />
            </Route>
            <Redirect from=":id/nominate" to="nominate/:id" />
            <Redirect from=":id/vote" to="vote/:id" />
          </Route>
          <Route onEnter={requireAuth}>
            <Route path="exhibition/:id" component={ExhibitRegistration} />
            <Route path="pay">
              <IndexRoute component={PurchaseIndex} />
              <Route path=":type" component={PurchaseItem} />
            </Route>
            <Route path="upgrade">
              <IndexRoute component={Upgrade} />
              <Route path=":id" component={Upgrade} />
            </Route>
          </Route>
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
