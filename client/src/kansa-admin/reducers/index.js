import { combineReducers } from 'redux'

import app from './app'
import paymentData from './payment-data'
import payments from './payments'
import people from './people'
import registration from './registration'
import user from './user'

export default combineReducers({ app, paymentData, payments, people, registration, user })
