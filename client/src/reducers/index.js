import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import app from './app'
import user from './user'

export default combineReducers({
  app,
  user,
  routing: routerReducer
});
