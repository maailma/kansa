import api from '../lib/api'
import { memberSet } from '../membership/actions'
import { getPurchaseList } from './actions'

export default ({ dispatch }) => (next) => (action) => {
  const handleError = (error) => next({ ...action, error })

  if (!action.error) {
    switch (action.type) {
      case 'BUY_DAYPASS': {
        const { amount, callback, email, person, source } = action
        api.POST('purchase/daypass', {
          amount,
          email,
          source,
          passes: [person]
        })
        .then(() => api.GET('user')
          .then(user => dispatch(memberSet(user)))
          .catch(() => { /* isgnore auth error */ })
        )
        .then(() => callback && callback())
        .catch(handleError)
      } return

      case 'BUY_MEMBERSHIP': {
        const { amount, callback, email, member, source } = action
        api.POST('purchase', {
          amount,
          email,
          source,
          new_members: [member]
        })
        .then(() => api.GET('user')
          .then(user => dispatch(memberSet(user)))
          .catch(() => { /* isgnore auth error */ })
        )
        .then(() => callback && callback())
        .catch(handleError)
      } return

      case 'BUY_OTHER': {
        const { account, callback, email, items, source } = action
        api.POST('purchase/other', {
          account,
          email,
          source,
          items: items.toJS ? items.toJS() : items
        })
        .then(() => {
          callback && callback()
          dispatch(getPurchaseList())
        })
        .catch(handleError)
      } return

      case 'BUY_UPGRADE': {
        const { amount, callback, email, id, membership, paper_pubs, source } = action
        api.POST('purchase', {
          amount,
          email,
          source,
          upgrades: [{ id, membership, paper_pubs }]
        })
        .then(() => api.GET('user'))
        .then(user => dispatch(memberSet(user)))
        .then(() => callback && callback())
        .catch(handleError)
      } return

      case 'GET_DAYPASS_PRICES': {
        api.GET('purchase/daypass-prices')
        .then(prices => next({ ...action, prices }))
        .catch(handleError)
      } return

      case 'GET_PURCHASE_DATA': {
        api.GET('purchase/data')
        .then(data => next({ ...action, data }))
        .catch(handleError)
      } return

      case 'GET_PURCHASE_LIST': {
        api.GET('purchase/list')
        .then(list => next({ ...action, list }))
        .catch(handleError)
      } return

      case 'GET_STRIPE_KEYS': {
        api.GET('purchase/keys')
        .then(keys => next({ ...action, keys }))
        .catch(handleError)
      } return
    }
  }
  return next(action)
}
