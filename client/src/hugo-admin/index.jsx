import '../lib/polyfills'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { browserHistory, hashHistory, IndexRedirect, Route, Router } from 'react-router'
import { routerMiddleware, routerReducer, syncHistoryWithStore } from 'react-router-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux'

import App from './app'
import Canon from './canon'
import Finalists from './finalists'
import middleware from './middleware'
import reducer from './reducer'
import './style.css'

const history = ENV === 'production' ? browserHistory : hashHistory
const store = createStore(
  combineReducers({
    hugoAdmin: reducer,
    routing: routerReducer
  }),
  applyMiddleware(
    middleware,
    routerMiddleware(history)
  )
)

const scrollUpOnChange = (_, { location: { action } }) => {
  if (action !== 'POP') window.scrollTo(0, 0)
}

ReactDOM.render(
  <Provider store={store} >
    <MuiThemeProvider muiTheme={getMuiTheme({
      fontFamily: '"Open Sans", sans-serif'
    })}>
      <Router history={syncHistoryWithStore(history, store)}>
        <Route path='/' component={App} onChange={scrollUpOnChange}>
          <IndexRedirect to='hugo-admin' />
          <Route path='hugo-admin'>
            <IndexRedirect to='Novel' />
            <Route path=':category'>
              <IndexRedirect to='nominations' />
              <Route path='finalists' component={Finalists} />
              <Route path='nominations' component={Canon} />
            </Route>
          </Route>
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
