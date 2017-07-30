import { PropTypes } from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'


export const shapeEntry = ImmutablePropTypes.mapContains({
  label: PropTypes.string,
  required: PropTypes.bool,
  type: PropTypes.string.isRequired,
  values: ImmutablePropTypes.mapOf(
    PropTypes.string,
    PropTypes.string
  )
});

export const shape = ImmutablePropTypes.mapOf(shapeEntry, PropTypes.string);

export const type = ImmutablePropTypes.mapContains({
  amount: PropTypes.number,
  key: PropTypes.string.isRequired,
  label: PropTypes.string
});

export const types = ImmutablePropTypes.orderedMapOf(type, PropTypes.string);

export const categoryData = ImmutablePropTypes.mapContains({ shape, types });

export const data = ImmutablePropTypes.mapOf(categoryData, PropTypes.string);

export const keys = ImmutablePropTypes.mapOf(PropTypes.string);

export const purchase = ImmutablePropTypes.mapContains({
  id: PropTypes.number.isRequired,
  created: PropTypes.string.isRequired,
  updated: PropTypes.string,
  payment_email: PropTypes.string.isRequired,
  status: PropTypes.string,
  stripe_charge_id: PropTypes.string,
  stripe_receipt: PropTypes.string,
  stripe_token: PropTypes.string,
  error: PropTypes.string,
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  person_id: PropTypes.number,
  person_name: PropTypes.string,
  category: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  data: ImmutablePropTypes.map,
  invoice: PropTypes.string,
  comments: PropTypes.string
});

export const list = ImmutablePropTypes.listOf(purchase);

export const priceEntry = ImmutablePropTypes.mapContains({
  amount: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired
});

export const memberships = ImmutablePropTypes.mapOf(priceEntry, PropTypes.string);

export const prices = ImmutablePropTypes.mapContains({
  memberships: memberships.isRequired,
  PaperPubs: priceEntry.isRequired
});

export const root = ImmutablePropTypes.mapContains({
  data,
  list,
  prices
})
