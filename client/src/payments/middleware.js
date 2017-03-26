import API from '../lib/api'
import { memberSet } from '../membership/actions'
import { getPurchaseList } from './actions'
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
      }, purchase.toJS ? purchase.toJS() : purchase))
        .then(() => {
          callback && callback();
          dispatch(getPurchaseList());
        })
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

    case 'GET_PURCHASE_LIST': {
      api.GET('kansa/purchase/list')
        .then(list => {
          next({ ...action, list });
        })
        .catch(handleError);
    } return;

  }
  return next(action);
}
