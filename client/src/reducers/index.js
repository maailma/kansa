import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import app from './app'
import nominations from '../hugo/reducers/nominations'
import user from './user'

export default combineReducers({
  app,
  nominations,
  user,
  routing: routerReducer
});
