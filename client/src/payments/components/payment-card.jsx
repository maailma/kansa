import React, { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider'

import * as PaymentPropTypes from '../proptypes'

const PaymentCard = ({ label, purchase, shape }) => {
  const {
    amount, category, comments, data, invoice, paid, payment_email, person_name, stripe_charge_id
  } = purchase.toJS();
  const subtitle = category !== label ? category : '';
  return <Card
    style={{ marginBottom: 18 }}
  >
    <CardHeader
      style={{ display: 'flex', fontWeight: 600 }}
      title={label}
      subtitle={subtitle}
    >
      <div style={{ flexGrow: 1, textAlign: 'right' }}>
        <div
          style={{ color: 'rgba(0, 0, 0, 0.870588)', fontSize: 15 }}
        >
          €{amount / 100}<br/>
        </div>
        {paid ? <div
          style={{ color: 'rgba(0, 0, 0, 0.541176)', fontSize: 14 }}
          title={paid}
        >
          {paid.slice(0, paid.indexOf('T'))}
        </div> : null}
      </div>
    </CardHeader>
    <CardText style={{ paddingTop: 0 }}>
      <table style={{ margin: 0, width: '100%' }}><tbody>
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
          <td style={{ fontFamily: 'monospace' }}>{stripe_charge_id}</td>
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
  </Card>;
};

PaymentCard.propTypes = {
  label: PropTypes.string.isRequired,
  purchase: PaymentPropTypes.purchase.isRequired,
  shape: PaymentPropTypes.shape
}

export default PaymentCard;
