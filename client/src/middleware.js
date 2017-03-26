import { applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'

import hugo from './hugo/middleware'
import hugoAdmin from './hugo-admin/middleware'
import membership from './membership/middleware'
import payments from './payments/middleware'
import logger from './app/middleware'

export default (history) => applyMiddleware(
  hugo, hugoAdmin, membership, payments, logger,
  routerMiddleware(history)
);
