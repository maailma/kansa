import '../lib/polyfills'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { createStore } from 'redux'

import 'react-virtualized/styles.css'
import './styles/app.css'

import api from '../lib/api'
import {
  accent1Color,
  primary1Color,
  primary2Color,
  disabledColor
} from '../theme/colors'
import App from './components/App'
import { loadRegistrationState } from './components/RegistrationOptions'
import reducers from './reducers'

const store = createStore(reducers, loadRegistrationState())
api
  .GET('user')
  .then(data => store.dispatch({ type: 'LOGIN', data }))
  .then(() => api.GET('people'))
  .then(data => store.dispatch({ type: 'INIT PEOPLE', data }))
  .then(() => {
    const wsUri = `wss://${API_HOST || location.host}/api/people/updates`
    const ws = new ReconnectingWebSocket(wsUri)
    ws.onmessage = msg => {
      const data = JSON.parse(msg.data)
      store.dispatch({ type: 'SET PERSON', data })
    }
  })
  .then(() => api.GET('shop/list', { all: 1 }))
  .then(data => store.dispatch({ type: 'INIT PAYMENTS', data }))
  .then(() => api.GET('shop/data'))
  .then(data => store.dispatch({ type: 'SET PAYMENT DATA', data }))
  .catch(e => console.error(e))

const theme = getMuiTheme({
  fontFamily: '"Open Sans", sans-serif',
  card: {
    titleColor: accent1Color,
    subtitleColor: disabledColor
  },
  palette: { primary1Color, primary2Color, accent1Color, disabledColor },
  tabs: {
    backgroundColor: 'transparent',
    selectedTextColor: 'rgba(0,0,0,0.6)',
    textColor: 'rgba(0,0,0,0.4)'
  },
  textField: {
    errorColor: accent1Color
  }
})

render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={theme}>
      <App api={api} />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('react')
)
