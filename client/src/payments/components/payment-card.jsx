import React, { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import Divider from 'material-ui/Divider'

import { API_ROOT } from '../../constants'
import { orange, lightBlue } from '../../theme'
import * as PaymentPropTypes from '../proptypes'

const PaymentActions = ({ person_id, status, type, userIds }) => {
  switch (type) {
    case 'ss-token':
      return person_id && (status === 'succeeded') && userIds && userIds.includes(person_id) ? (
        <CardActions style={{ display: 'flex' }}>
          <FlatButton
            href={`${API_ROOT}kansa/people/${person_id}/ballot`}
            label="Download personal ballot"
            primary={true}
            target="_blank"
          />
        </CardActions>
      ) : null;
  }
  return null;
}

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
          €{amount / 100}<br/>
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
    amount, category, comments, data, error, invoice, payment_email, person_id,
    person_name, status, stripe_charge_id, stripe_receipt, type, updated
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
        <tr>
          <td>Charge id:</td>
          <td style={{ fontFamily: 'monospace' }}>{stripe_receipt || stripe_charge_id}</td>
        </tr>
        {invoice ? <tr>
          <td>Invoice:</td>
          <td>{invoice}</td>
        </tr> : null}
        <tr><td colSpan="2" style={{ paddingTop: 6, paddingBottom: 4 }}><Divider /></td></tr>
        {Object.keys(data).filter(key => data[key]).map((key) => (
          <tr key={key}>
            <td>{shape && shape.getIn([key, 'label']) || key}:</td>
            <td>{data[key]}</td>
          </tr>
        ))}
        {comments ? <tr>
          <td>Comments:</td>
          <td>{comments}</td>
        </tr> : null}
      </tbody></table>
    </CardText>
    <PaymentActions person_id={person_id} status={status} type={type} userIds={userIds} />
  </Card>
}

PaymentCard.propTypes = {
  label: PropTypes.string.isRequired,
  purchase: PaymentPropTypes.purchase.isRequired,
  shape: PaymentPropTypes.shape,
  userIds: ImmutablePropTypes.listOf(PropTypes.number)
}

export default PaymentCard;
