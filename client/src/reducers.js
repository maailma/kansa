import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import app from './app/reducer'
import hugoAdmin from './hugo-admin/reducer'
import hugoVotes from './hugo-votes/reducer'
import nominations from './hugo-nominations/reducers/nominations'
import lookup from './membership/reducers/lookup'
import user from './membership/reducers/user'
import purchase from './payments/reducers'

export default combineReducers({
  app,
  hugoAdmin,
  hugoVotes,
  lookup,
  nominations,
  purchase,
  user,
  routing: routerReducer
});
