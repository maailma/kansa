import { fromJS, Map, OrderedMap } from 'immutable'
import { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');


const _PurchasePartPropTypes = {
  dataShape: ImmutablePropTypes.mapOf(
    ImmutablePropTypes.mapContains({
      label: PropTypes.string,
      required: PropTypes.bool,
      type: PropTypes.string.isRequired,
      values: ImmutablePropTypes.mapOf(
        PropTypes.string,
        PropTypes.string
      )
    }),
    PropTypes.string
  ),

  dataType: ImmutablePropTypes.mapContains({
    amount: PropTypes.number,
    key: PropTypes.string.isRequired,
    label: PropTypes.string
  }),

  priceItem: ImmutablePropTypes.mapContains({
    amount: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired
  })
}

export const PurchasePropTypes = {
  data: ImmutablePropTypes.mapOf(
    ImmutablePropTypes.mapContains({
      shape: _PurchasePartPropTypes.dataShape,
      types: ImmutablePropTypes.orderedMapOf(
        _PurchasePartPropTypes.dataType,
        PropTypes.string
      )
    }),
    PropTypes.string
  ),

  list: ImmutablePropTypes.listOf(
    ImmutablePropTypes.mapContains({
      id: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      category: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      currency: PropTypes.string.isRequired,
      stripe_charge_id: PropTypes.string,
      email: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      person_id: PropTypes.number,
      invoice: PropTypes.string,
      comments: PropTypes.string,
      data: ImmutablePropTypes.map
    })
  ),

  prices: ImmutablePropTypes.mapContains({
    memberships: ImmutablePropTypes.mapOf(
      _PurchasePartPropTypes.priceItem,
      PropTypes.string
    ).isRequired,
    PaperPubs: _PurchasePartPropTypes.priceItem.isRequired
  })
}


const defaultState = Map({
  data: null,
  list: null,
  prices: null,
});

export default function(state = defaultState, action) {
  if (action.error || action.module !== 'kansa') return state;
  switch (action.type) {

    case 'GET_PRICES':
      const { prices } = action;
      return state.set('prices', fromJS(prices));

    case 'GET_PURCHASE_DATA':
      const { data } = action;
      Object.keys(data).forEach(category => {
        const cd = data[category];
        cd.types = OrderedMap(cd.types.map(td => [td.key, fromJS(td)]));
      });
      return state.set('data', fromJS(data));

    case 'GET_PURCHASE_LIST':
      const { list } = action;
      return state.set('list', fromJS(list));

  }
  return state;
}
