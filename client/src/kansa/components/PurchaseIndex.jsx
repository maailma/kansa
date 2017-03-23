import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');

import { setScene } from '../../app/actions/app'
import { getPurchaseData } from '../actions'
import { PurchasePropTypes } from '../reducers/purchase'
import PurchaseSelectCard from './PurchaseSelectCard'

class PurchaseIndex extends React.Component {
  static propTypes = {
    getPurchaseData: PropTypes.func.isRequired,
    purchaseData: PurchasePropTypes.data,
    push: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { getPurchaseData, purchaseData, setScene } = this.props;
    if (!purchaseData) getPurchaseData();
    setScene({ title: 'New Purchase', dockSidebar: false });
  }

  render() {
    const { purchaseData, push } = this.props;
    if (!purchaseData) return null;
    const firstOffset = [0, 4, 2][purchaseData.size] || 0;
    return <Row>
      { purchaseData.entrySeq().map(([category, data], i) => (
        <Col
          xs={12} sm={6}
          lg={4} lgOffset={i > 0 ? 0 : firstOffset}
          key={category}
        >
          <PurchaseSelectCard
            data={data}
            label={category}
            onSelect={(type) => push(`/pay/${category}/${type}`)}
            title={category}
          />
        </Col>
      ))}
    </Row>;
  }
}

export default connect(
  ({ purchase }) => ({
    purchaseData: purchase.get('data')
  }), {
    getPurchaseData,
    push,
    setScene,
  }
)(PurchaseIndex);
