import { Map } from 'immutable'
import { push, replace } from 'react-router-redux'

import API from '../api';
import { memberSet } from '../actions'
import { API_ROOT, PATH_IN, PATH_OUT } from '../constants'

const api = new API(API_ROOT);

export default ({ dispatch }) => (next) => (action) => {
  const handleError = (error) => next({ ...action, error });

  //console.log('MW', action.type, action.error, action);
  if (!action.error) switch (action.type) {

    case 'KEY_REQUEST': {
      const { email } = action;
      if (!email) return next({ ...action, error: 'Email missing for key request' });
      api.POST('kansa/key', { email })
        .then(() => next(action))
        .catch(handleError);
    } return;

    case 'KEY_LOGIN': {
      const { email, key } = action;
      if (!email || !key) return next({ ...action, error: 'Missing parameters for key login' });
      api.POST('kansa/login', { email, key })
        .then(() => api.GET('kansa/user'))
        .then(user => {
          dispatch(memberSet(user));
          dispatch(push(PATH_IN));
        })
        .catch(err => {
          handleError(err);
          dispatch(push(PATH_OUT));
        });
    } return;

    case 'TRY_LOGIN': {
      api.GET('kansa/user')
        .then(user => {
          dispatch(memberSet(user));
          dispatch(replace(PATH_IN));
        })
        .catch(err => {
          handleError(err);
          dispatch(replace(PATH_OUT));
        });
    } return;

    case 'LOGOUT': {
      api.GET('kansa/logout')
        .then(() => {
          next(action);
          dispatch(push(PATH_OUT));
        })
        .catch(handleError);
    } return;

    case 'MEMBER_UPDATE': {
      const { id, changes } = action;
      if (!id || !Map.isMap(changes) || changes.isEmpty()) {
        return next({ ...action, error: `Bad parameters for member update: ${JSON.stringify(action)}` });
      }
      api.POST(`kansa/people/${id}`, changes.toJS())
        .then(() => next(action))
        .catch(handleError);
    } return;

  }
  return next(action);
}
