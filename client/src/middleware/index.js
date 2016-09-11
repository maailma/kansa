import { applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'

import hugo from './hugo'
import kansa from './kansa'
import logger from './logger'

export default (history) => applyMiddleware(
  hugo, kansa, logger,
  routerMiddleware(history)
);
