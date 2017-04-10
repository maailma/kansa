import { List } from 'immutable'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');

import { setScene } from '../../app/actions/app'
import { getPurchaseData, getPurchaseList } from '../actions'
import * as PurchasePropTypes from '../proptypes'
import PurchaseItemCard from './PurchaseItemCard'
import PurchaseSelectCard from './PurchaseSelectCard'

class PurchaseIndex extends React.Component {
  static propTypes = {
    getPurchaseData: PropTypes.func.isRequired,
    getPurchaseList: PropTypes.func.isRequired,
    purchaseData: PurchasePropTypes.data,
    purchaseList: PurchasePropTypes.list,
    push: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { getPurchaseData, getPurchaseList, purchaseData, purchaseList, setScene } = this.props;
    if (!purchaseData) getPurchaseData();
    if (!purchaseList) getPurchaseList();
    setScene({ title: 'Payments', dockSidebar: false });
  }

  get nextPurchaseCards() {
    const { purchaseData, push } = this.props;
    return purchaseData.entrySeq()
      .filter(([category, data]) => !data.get('unlisted'))
      .map(([category, data]) => (
        <PurchaseSelectCard
          data={data}
          key={category}
          label={category}
          onSelect={(type) => push(`/pay/${type}`)}
          title={`New ${category}`}
        />
      ));
  }

  get prevPurchaseCards() {
    const { purchaseData, purchaseList } = this.props;
    return purchaseList.map((purchase, i) => {
      const categoryData = purchaseData.get(purchase.get('category'));
      const type = purchase.get('type');
      return (
        <PurchaseItemCard
          key={i}
          label={categoryData.getIn(['types', type, 'label']) || type}
          purchase={purchase}
          shape={categoryData.get('shape')}
        />
      );
    });
  }

  render() {
    const { purchaseData, purchaseList } = this.props;
    if (!purchaseData) return null;
    const ppOk = purchaseList && purchaseList.size > 0;
    return <Row>
      {ppOk ? (
        <Col xs={12} sm={6} lg={4} lgOffset={2}>
          {this.prevPurchaseCards}
        </Col>
      ) : null}
      <Col
        xs={12}
        sm={6} smOffset={ppOk ? 0 : 3}
        lg={4} lgOffset={ppOk ? 0 : 4}
      >
        {this.nextPurchaseCards}
      </Col>
    </Row>;
  }
}

export default connect(
  ({ purchase }) => ({
    purchaseData: purchase.get('data'),
    purchaseList: purchase.get('list')
  }), {
    getPurchaseData,
    getPurchaseList,
    push,
    setScene,
  }
)(PurchaseIndex);
