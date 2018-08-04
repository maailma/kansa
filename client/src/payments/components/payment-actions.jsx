import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'

import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'

import { showMessage } from '../../app/actions/app'
import { API_ROOT } from '../../constants'
import { buyOther } from '../actions'
import * as PaymentPropTypes from '../proptypes'
import StripeCheckout from './stripe-checkout'

const PaymentActions = ({ buyOther, purchase, showMessage, userIds }) => {
  const {
    amount,
    id,
    invoice,
    payment_email,
    person_id,
    status,
    type
  } = purchase.toJS()
  const account = 'default'
  const actions = []
  switch (status) {
    case 'invoice':
      if (amount && id && payment_email) {
        actions.push(
          <StripeCheckout
            account={account}
            amount={amount}
            currency="EUR"
            description={`Invoice #${invoice || id}`}
            email={payment_email}
            key="invoice"
            onCheckout={source => {
              showMessage(`Charging ${payment_email} EUR ${amount / 100}...`)
              buyOther(account, payment_email, source, [{ id }], () => {
                showMessage('Payment successful!')
              })
            }}
          >
            <FlatButton
              label="Pay by card"
              style={{ color: 'white', fontWeight: 'bold' }}
            />
          </StripeCheckout>
        )
      }
      break

    case 'succeeded':
      switch (type) {
        case 'ss-token':
          if (person_id && userIds && userIds.includes(person_id)) {
            actions.push(
              <FlatButton
                href={`${API_ROOT}people/${person_id}/ballot`}
                key="ss-token"
                label="Download personal ballot"
                primary
                target="_blank"
              />
            )
          }
          break
      }
      break
  }
  return actions.length === 0 ? null : (
    <CardActions style={{ display: 'flex' }}>{actions}</CardActions>
  )
}

PaymentActions.propTypes = {
  purchase: PaymentPropTypes.purchase.isRequired,
  userIds: ImmutablePropTypes.listOf(PropTypes.number)
}

export default connect(
  null,
  {
    buyOther,
    showMessage
  }
)(PaymentActions)
