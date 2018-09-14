import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import { showMessage } from '../../app/actions/app'
import { getStripeKeys } from '../actions'

let stripeLoading = false
const loadStripe = done => {
  if (typeof Stripe !== 'undefined') return done()
  stripeLoading = true
  const script = document.createElement('script')
  script.src = 'https://js.stripe.com/v2/'
  script.async = 1
  script.onload = () => {
    stripeLoading = false
    done()
  }
  script.onerror = event => {
    stripeLoading = false
    done(event)
  }
  document.body.appendChild(script)
}

class StripeDirectDebit extends React.Component {
  static propTypes = {
    iban: PropTypes.string,
    onCharge: PropTypes.func.isRequired,
    getStripeKeys: PropTypes.func.isRequired,
    owner: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.shape({
        city: PropTypes.string,
        country: PropTypes.string,
        postal_code: PropTypes.string
      })
    }),
    showMessage: PropTypes.func.isRequired,
    stripeKey: PropTypes.string
  }

  componentWillMount() {
    if (!this.props.stripeKey) this.props.getStripeKeys()
  }

  componentDidMount() {
    if (!stripeLoading) {
      loadStripe(err => {
        const { showMessage, stripeKey } = this.props
        if (err) {
          showMessage('Error loading Stripe')
          console.error(err)
        } else if (stripeKey) {
          Stripe.setPublishableKey(stripeKey)
        }
      })
    }
  }

  componentWillReceiveProps({ stripeKey }) {
    if (stripeKey !== this.props.stripeKey && typeof Stripe !== 'undefined') {
      Stripe.setPublishableKey(stripeKey)
    }
  }

  charge = () => {
    const { iban, onCharge, owner, showMessage } = this.props
    Stripe.source.create(
      {
        type: 'sepa_debit',
        currency: 'eur',
        sepa_debit: { iban },
        owner
      },
      (status, response) => {
        if (response.error) {
          showMessage(response.error.message)
          console.error('Stripe source creation failed', response.error)
        } else if (response.status === 'chargeable') {
          onCharge(response)
        } else {
          showMessage(
            'Error: Account not chargeable? status: ' + response.status
          )
        }
      }
    )
  }

  render() {
    return <span onClick={this.charge} children={this.props.children} />
  }
}

export default connect(
  ({ purchase }) => ({
    stripeKey: purchase.getIn(['keys', 'default'])
  }),
  {
    getStripeKeys,
    showMessage
  }
)(StripeDirectDebit)
