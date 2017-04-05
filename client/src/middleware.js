import { applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'

import hugoAdmin from './hugo-admin/middleware'
import hugoNominations from './hugo-nominations/middleware'
import hugoVotes from './hugo-votes/middleware'
import membership from './membership/middleware'
import payments from './payments/middleware'
import logger from './app/middleware'

export default (history) => applyMiddleware(
  hugoAdmin, hugoNominations, hugoVotes, membership, payments, logger,
  routerMiddleware(history)
);
