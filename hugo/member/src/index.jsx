import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRedirect, hashHistory } from 'react-router'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

// Needed by material-ui for onTouchTap, see http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

import App from './components/App'
import Nominate from './components/Nominate'

import API from './api'
import nominationSubmitter from './middleware/nominationSubmitter'
import reducers from './reducers'
import { setNominations } from './actions'

const api = new API(`https://${process.env.HUGO_API_HOST}/api/`);
const store = createStore(reducers, applyMiddleware(
  nominationSubmitter(api)
));

const validatePerson = (nextState, replace, callback) => api.GET('kansa/user')
  .then(data => {
    const id = parseInt(nextState.params.id);
    const person = data.people.find(p => p.id === id) || {};
    store.dispatch({ type: 'SET PERSON', person });
    callback();
  })
  .catch(error => {
    console.error(error);
    replace('/login');
    callback(error);
  });

const getNominations = (nextState, replace, callback) => api.GET(`hugo/${nextState.params.id}/nominations`)
  .then(data => {
    data.forEach(catData => store.dispatch(setNominations(catData)))
    callback();
  })
  .catch(error => {
    console.error(error);
    callback(error);
  });

const NoMatch = () => <div>404!?</div>;

render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Router history={hashHistory}>
        <Route component={ props => <App { ...props } title={process.env.HUGO_TITLE} /> } >
          <Route path="/:id" onEnter={validatePerson}>
            <IndexRedirect to="nominate" />
            <Route path="nominate" component={Nominate} onEnter={getNominations} />
          </Route>
          <Route path="*" component={NoMatch} />
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('app')
);
