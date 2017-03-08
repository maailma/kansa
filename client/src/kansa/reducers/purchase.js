import { fromJS, Map, OrderedMap } from 'immutable'
import { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');


const _PurchasePartPropTypes = {
  priceItem: ImmutablePropTypes.mapContains({
    amount: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired
  }),

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
  })
}

export const PurchasePropTypes = {
  price: ImmutablePropTypes.mapContains({
    memberships: ImmutablePropTypes.mapOf(
      _PurchasePartPropTypes.priceItem,
      PropTypes.string
    ).isRequired,
    PaperPubs: _PurchasePartPropTypes.priceItem.isRequired
  }),

  data: ImmutablePropTypes.mapOf(
    ImmutablePropTypes.mapContains({
      shape: _PurchasePartPropTypes.dataShape,
      types: ImmutablePropTypes.orderedMapOf(
        _PurchasePartPropTypes.dataType,
        PropTypes.string
      )
    }),
    PropTypes.string
  )
}


export default function(state = Map(), action) {
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

  }
  return state;
}
