import { List } from 'immutable'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');

import { setScene } from '../app/actions/app'
import { getPurchaseData, getPurchaseList } from './actions'
import * as PaymentPropTypes from './proptypes'
import PaymentCard from './components/payment-card'
import SelectNewPaymentCard from './components/select-new-payment-card'

class PaymentsIndex extends React.Component {
  static propTypes = {
    getPurchaseData: PropTypes.func.isRequired,
    getPurchaseList: PropTypes.func.isRequired,
    purchaseData: PaymentPropTypes.data,
    purchaseList: PaymentPropTypes.list,
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
        <SelectNewPaymentCard
          data={data}
          key={category}
          label={category}
          onSelect={(type) => push(`/pay/${type}`)}
          title={`New ${category}`}
        />
      ));
  }

  get prevPurchaseCards() {
    const { purchaseData, purchaseList, userIds } = this.props;
    return purchaseList.map((purchase, i) => {
      const category = purchase.get('category');
      const type = purchase.get('type');
      const categoryData = this.purchaseCategoryData(category, type);
      return (
        <PaymentCard
          key={i}
          label={categoryData.getIn(['types', type, 'label']) || type}
          purchase={purchase}
          shape={categoryData.get('shape')}
          userIds={userIds}
        />
      );
    });
  }

  purchaseCategoryData(category, type) {
    const { purchaseData } = this.props;
    return purchaseData.get(category) ||
      purchaseData.find(cd => cd.get('types').some(td => td.get('key') === type))
  }

  render() {
    const { purchaseData, purchaseList } = this.props;
    if (!purchaseData) return null;
    const ppOk = purchaseList && purchaseList.size > 0;
    return <Row style={{ marginBottom: -16 }}>
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
  ({ purchase, user }) => ({
    purchaseData: purchase.get('data'),
    purchaseList: purchase.get('list'),
    userIds: user.get('people').map(p => p.get('id'))
  }), {
    getPurchaseData,
    getPurchaseList,
    push,
    setScene,
  }
)(PaymentsIndex);
