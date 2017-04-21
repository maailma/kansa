import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
const ImmutablePropTypes = require('react-immutable-proptypes');
import ReactStripeCheckout from 'react-stripe-checkout'

import { getStripeKeys } from '../actions'
import * as PaymentPropTypes from '../proptypes'

class StripeCheckout extends React.Component {
  static propTypes = {
    account: PropTypes.string,
    amount: PropTypes.number,
    currency: PropTypes.string,
    description: PropTypes.string,
    email: PropTypes.string,
    onCheckout: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    getStripeKeys: PropTypes.func.isRequired,
    stripeKeys: PaymentPropTypes.keys,
  }

  componentWillMount() {
    const { getStripeKeys, stripeKeys } = this.props
    if (!stripeKeys) getStripeKeys()
    ReactStripeCheckout.stripeHandler = null
  }

  componentWillReceiveProps({ account, stripeKeys }) {
    if (account !== this.props.account) ReactStripeCheckout.stripeHandler = null
  }

  render() {
    const { account, amount, children, currency, description, email, onCheckout, onClose, stripeKeys } = this.props
    return stripeKeys && (
      <ReactStripeCheckout
        amount={amount}
        closed={onClose}
        currency={currency || 'EUR'}
        description={description}
        email={email}
        name={TITLE}
        stripeKey={stripeKeys.get(account || 'default')}
        token={onCheckout}
        triggerEvent='onTouchTap'
        zipCode={true}
      >{children}</ReactStripeCheckout>
    )
  }
}

export default connect(
  ({ purchase }) => ({
    stripeKeys: purchase.get('keys')
  }), {
    getStripeKeys
  }
)(StripeCheckout)
