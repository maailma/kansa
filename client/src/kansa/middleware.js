import { Map } from 'immutable'
import { push, replace } from 'react-router-redux'

import API from '../lib/api'
import { showMessage } from '../app/actions/app'
import { memberSet } from './actions'
import { API_ROOT } from '../constants'

const api = new API(API_ROOT);

export default ({ dispatch }) => (next) => (action) => {
  const handleError = (error) => next({ ...action, error });

  if (!action.error) switch (action.type) {

    case 'BUY_MEMBERSHIP': {
      const { amount, callback, member, token } = action;
      api.POST('kansa/purchase', {
        amount,
        email: token.email,
        token: token.id,
        new_members: [member]
      })
        .then(() => api.GET('kansa/user'))
        .then(user => dispatch(memberSet(user)))
        .then(() => callback && callback())
        .catch(handleError);
    } return;

    case 'BUY_OTHER': {
      const { amount, callback, purchase, token } = action;
      api.POST('kansa/purchase/other', Object.assign({
        amount,
        email: token.email,
        token: token.id,
      }, purchase))
        .then(() => callback && callback())
        .catch(handleError);
    } return;

    case 'BUY_UPGRADE': {
      const { amount, callback, id, membership, paper_pubs, token } = action;
      api.POST('kansa/purchase', {
        amount,
        email: token.email,
        token: token.id,
        upgrades: [{ id, membership, paper_pubs }]
      })
        .then(() => api.GET('kansa/user'))
        .then(user => dispatch(memberSet(user)))
        .then(() => callback && callback())
        .catch(handleError);
    } return;

    case 'GET_PRICES': {
      api.GET('kansa/purchase/prices')
        .then(prices => {
          next({ ...action, prices });
        })
        .catch(handleError);
    } return;

    case 'GET_PURCHASE_DATA': {
      api.GET('kansa/purchase/data')
        .then(data => {
          next({ ...action, data });
        })
        .catch(handleError);
    } return;

    case 'KEY_REQUEST': {
      const { email } = action;
      if (!email) return next({ ...action, error: 'Email missing for key request' });
      api.POST('kansa/key', { email })
        .then(() => next(action))
        .catch(handleError);
      dispatch(showMessage('Sending login key and link to ' + action.email));
    } return;

    case 'KEY_LOGIN': {
      const { email, key, path } = action;
      if (!email || !key) return handleError('Missing parameters for key login');
      api.POST('kansa/login', { email, key })
        .then(() => api.GET('kansa/user'))
        .then(user => {
          dispatch(memberSet(user));
          dispatch(replace(path || '/'));
        })
        .catch(err => {
          handleError(err);
          dispatch(push('/'));
        });
    } return;

    case 'TRY_LOGIN': {
      const { callback } = action;
      api.GET('kansa/user')
        .then(user => {
          dispatch(memberSet(user));
          callback();
        })
        .catch(err => {
          if (err.status !== 'unauthorized') handleError(err);
          callback(err);
        });
    } return;

    case 'LOGOUT': {
      api.GET('kansa/logout')
        .then(() => {
          next(action);
          dispatch(push('/'));
        })
        .catch(handleError);
    } return;

    case 'MEMBER_UPDATE': {
      const { id, changes } = action;
      if (!id || !Map.isMap(changes) || changes.isEmpty()) {
        return handleError(`Bad parameters for member update: ${JSON.stringify(action)}`);
      }
      api.POST(`kansa/people/${id}`, changes.toJS())
        .then(() => next(action))
        .catch(handleError);
    } return;

  }
  return next(action);
}
