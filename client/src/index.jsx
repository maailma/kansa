import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { IndexRoute, Router, Route, browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createStore } from 'redux'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import { keyLogin, tryLogin } from './app/actions/auth'
import { PATH_OUT } from './constants'
import App from './app/components/App'
import Participate from './1980/Participate'
import Nominate from './hugo/components/Nominate'
import middleware from './middleware'
import reducers from './reducers'

import './app/style.css'
const theme = getMuiTheme({
  fontFamily: '"Open Sans", sans-serif'
});

const history = process.env.NODE_ENV === 'production' ? browserHistory : hashHistory;
const store = createStore(reducers, middleware(history));

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-66635432-2', 'auto');

history.listen(({ pathname }) => {
  if (pathname.indexOf('/login') !== -1) pathname = '/login';
  ga('set', 'page', pathname);
  ga('send', 'pageview');
});

const authCheck = ({ location: { pathname }}, replace, callback) => {
  const email = store.getState().user.get('email');
  if (email) callback();
  else store.dispatch(tryLogin(err => {
    if (err && pathname !== PATH_OUT) replace(PATH_OUT);
    callback();
  }));
}

const doLogin = ({ params: { email, key } }) => {
  store.dispatch(keyLogin(email, key));
}

ReactDOM.render(
  <Provider store={store} >
    <MuiThemeProvider muiTheme={theme}>
      <Router history={syncHistoryWithStore(history, store)}>
        <Route path="/" component={App} >
          <IndexRoute onEnter={authCheck} component={Nominate} />
          <Route path="participate" onEnter={authCheck} component={Participate} />
          <Route path="login/:email/:key" onEnter={doLogin} />
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
