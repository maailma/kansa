import { combineReducers } from 'redux'

import paymentData from './payment-data'
import payments from './payments'
import people from './people'
import user from './user'

export default combineReducers({ paymentData, payments, people, user })
