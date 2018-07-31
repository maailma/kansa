import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
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
    stripeKeys: PaymentPropTypes.keys
  }

  componentDidMount () {
    const { getStripeKeys, stripeKeys } = this.props
    if (!stripeKeys) getStripeKeys()
  }

  render () {
    const { account, amount, children, currency, description, disabled, email, onCheckout, onClose, stripeKeys } = this.props
    return stripeKeys && (
      <ReactStripeCheckout
        amount={amount}
        closed={onClose}
        currency={currency || 'EUR'}
        description={description}
        disabled={disabled}
        email={email}
        name={TITLE}
        reconfigureOnUpdate={true}
        stripeKey={stripeKeys.get(account || 'default')}
        token={onCheckout}
        triggerEvent='onClick'
        zipCode
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
