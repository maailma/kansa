import { combineReducers } from 'redux';

import person from './person';
import nominations from './nominations';

export default combineReducers({ person, nominations });

