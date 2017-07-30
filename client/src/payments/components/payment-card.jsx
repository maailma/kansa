import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import { Card, CardHeader, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider'

import { orange, lightBlue } from '../../theme'
import * as PaymentPropTypes from '../proptypes'
import PaymentActions from './payment-actions'

const PaymentCardHeader = ({ amount, status, subtitle, title, updated }) => {
  let amountColor, statusColor, subtitleColor, titleColor
  const statusTitle = updated ? `Payment ${status} on ${updated}` : null
  if (status === 'succeeded') {
    if (updated) status = updated.slice(0, updated.indexOf('T'))
    amountColor = 'rgba(0, 0, 0, 0.870588)'
    statusColor = 'rgb(128,128,128)'
    subtitleColor = 'rgb(128,128,128)'
    titleColor = orange
  } else {
    amountColor = 'rgba(255,255,255,0.5)'
    statusColor = 'white'
    subtitleColor = 'rgba(255,255,255,0.5)'
    titleColor = 'white'
  }
  return (
    <CardHeader
      style={{ display: 'flex', fontWeight: 600 }}
      title={title}
      titleColor={titleColor}
      subtitle={subtitle !== title ? subtitle : ''}
      subtitleColor={subtitleColor}
    >
      <div style={{ flexGrow: 1, textAlign: 'right' }}>
        <div style={{ color: amountColor, fontSize: 15 }}>
          €{amount / 100}<br />
        </div>
        <div
          style={{ color: statusColor, fontSize: 14, textTransform: 'uppercase' }}
          title={statusTitle}
        >{status}</div>
      </div>
    </CardHeader>
  )
}

const PaymentCard = ({ label, purchase, shape, userIds }) => {
  const {
    amount, category, comments, data, error, invoice, payment_email,
    person_name, status, stripe_charge_id, stripe_receipt, updated
  } = purchase.toJS()
  const backgroundColor = status === 'succeeded' ? 'white' : status === 'failed' ? orange : lightBlue
  return <Card
    style={{ backgroundColor, marginBottom: 18 }}
  >
    <PaymentCardHeader
      amount={amount}
      status={status}
      subtitle={category}
      title={label}
      updated={updated}
    />
    <CardText style={{ paddingTop: 0 }}>
      <table style={{ margin: 0, width: '100%' }}><tbody>
        {error ? <tr>
          <td>Error:</td>
          <td style={{ color: status === 'succeeded' ? orange : 'white', fontWeight: 'bold' }}>{error}</td>
        </tr> : null}
        <tr>
          <td>Payment from:</td>
          <td>{payment_email}</td>
        </tr>
        <tr>
          <td>Payment for:</td>
          <td>{person_name}</td>
        </tr>
        {stripe_receipt || stripe_charge_id ? <tr>
          <td>Charge id:</td>
          <td style={{ fontFamily: 'monospace' }}>{stripe_receipt || stripe_charge_id}</td>
        </tr> : null}
        {invoice ? <tr>
          <td>Invoice:</td>
          <td>{invoice}</td>
        </tr> : null}
        <tr><td colSpan='2' style={{ paddingTop: 6, paddingBottom: 4 }}><Divider /></td></tr>
        {Object.keys(data).filter(key => data[key]).map((key) => {
          let val = data[key]
          if (val && typeof data[key] === 'object') {
            val = Object.keys(val).map(k => `${k}: ${val[k]}`).join(', ')
          }
          return (
            <tr key={key}>
              <td>{shape && shape.getIn([key, 'label']) || key}:</td>
              <td>{val}</td>
            </tr>
          )
        })}
        {comments ? <tr>
          <td>Comments:</td>
          <td>{comments}</td>
        </tr> : null}
      </tbody></table>
    </CardText>
    <PaymentActions purchase={purchase} userIds={userIds} />
  </Card>
}

PaymentCard.propTypes = {
  label: PropTypes.string.isRequired,
  purchase: PaymentPropTypes.purchase.isRequired,
  shape: PaymentPropTypes.shape,
  userIds: ImmutablePropTypes.listOf(PropTypes.number)
}

export default PaymentCard
