import { Map } from 'immutable'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');
import StripeCheckout from 'react-stripe-checkout'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

import { setScene, showMessage } from '../../app/actions/app'
import { buyOther, getPurchaseData } from '../actions'
import * as PurchasePropTypes from '../proptypes'
import PurchaseForm from './PurchaseForm'
import PurchaseSelectCard from './PurchaseSelectCard'

class PurchaseItem extends React.Component {
  static propTypes = {
    buyOther: PropTypes.func.isRequired,
    email: PropTypes.string,
    getPurchaseData: PropTypes.func.isRequired,
    params: PropTypes.shape({
      category: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    }).isRequired,
    people: ImmutablePropTypes.list,
    purchaseData: PurchasePropTypes.data,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const { email = '', people } = props;
    this.state = {
      amount: 0,
      purchase: Map({
        comments: '',
        data: Map(),
        email,
        invoice: '',
        name: '',
        person_id: people.first().get('id'),
      }),
      sent: false,
    };
  }

  init({ params: { category, type }, purchaseData, replace, showMessage }) {
    const typeData = purchaseData.getIn([category, 'types', type]);
    if (typeData) {
      this.setState({ amount: typeData.get('amount') });
    } else {
      showMessage(`Unknown purchase type "${category}/${type}"`)
      replace('/pay');
    }
  }

  componentDidMount() {
    const { getPurchaseData, purchaseData, setScene } = this.props;
    setScene({ title: 'New Payment', dockSidebar: false });
    if (purchaseData) this.init(this.props);
    else getPurchaseData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.purchaseData) this.init(nextProps);
  }

  get dataShape() {
    const { params: { category }, purchaseData } = this.props;
    return purchaseData.getIn([category, 'shape'])
  }

  get disabledCheckout() {
    const { amount, purchase } = this.state;
    return !(
      amount > 0 &&
      (purchase.get('person_id') || purchase.get('email') && purchase.get('name')) &&
      this.dataShape.every((s, key) => !s.get('required') || purchase.getIn(['data', key]))
    );
  }

  get title() {
    const { params: { category, type }, purchaseData } = this.props;
    return purchaseData.getIn([category, 'types', type, 'label']);
  }

  onCheckout = (token) => {
    const { buyOther, params, push, showMessage } = this.props;
    const { amount, purchase } = this.state;
    const item = purchase.merge(params).set('amount', amount).filter(v => v).toJS();
    showMessage(`Charging ${purchase.get('email')} EUR ${amount / 100}...`);
    buyOther(token, [item], () => {
      showMessage('Payment successful!');
      push('/pay');
    });
  }

  render() {
    const { params: { category, type }, people, purchaseData } = this.props;
    if (!purchaseData) return null;
    const { amount, purchase, sent } = this.state;
    return (
      <Row>
        <Col
          xs={12}
          sm={8} smOffset={2}
          lg={6} lgOffset={3}
        >
          <Card>
            <CardHeader title={this.title} subtitle={category} />
            <CardText>
              <PurchaseForm
                amount={amount}
                onChange={(update) => this.setState({ purchase: purchase.merge(update) })}
                people={people}
                purchase={purchase}
                shape={this.dataShape}
              />
            </CardText>
            <CardActions style={{ alignItems: 'center', display: 'flex', paddingLeft: 16, paddingRight: 16 }}>
              <div style={{ flexGrow: 1 }}>
                Amount:
                <span style={{ paddingLeft: 8, paddingRight: 8 }}>€</span>
                <TextField
                  name="amount"
                  onChange={(ev, value) => {
                    const amount = value ? Math.floor(value * 100) : 0;
                    this.setState({ amount });
                  }}
                  style={{ width: 80 }}
                  type="number"
                  value={amount > 0 ? (amount / 100).toFixed(2) : ''}
                />
              </div>
              <StripeCheckout
                amount={amount}
                currency='EUR'
                description={this.title}
                email={purchase.get('email')}
                name={TITLE}
                stripeKey={STRIPE_KEY}
                token={this.onCheckout}
                triggerEvent='onTouchTap'
                zipCode={true}
              >
                <FlatButton
                  label={ sent ? 'Working...' : 'Pay by card' }
                  disabled={this.disabledCheckout}
                  onTouchTap={ () => this.setState({ sent: true }) }
                  style={{ flexShrink: 0 }}
                />
              </StripeCheckout>
            </CardActions>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default connect(
  ({ purchase, user }) => ({
    email: user.get('email'),
    people: user.get('people'),
    purchaseData: purchase.get('data')
  }), {
    buyOther,
    getPurchaseData,
    push,
    replace,
    setScene,
    showMessage
  }
)(PurchaseItem);
