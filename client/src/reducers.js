import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import app from './app/reducer'
import hugoAdmin from './hugo-admin/reducer'
import nominations from './hugo/reducers/nominations'
import purchase from './kansa/reducers/purchase'
import user from './kansa/reducers/user'

export default combineReducers({
  app,
  hugoAdmin,
  nominations,
  purchase,
  user,
  routing: routerReducer
});
