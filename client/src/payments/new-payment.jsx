import { Map } from 'immutable'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push, replace } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');
import StripeCheckout from 'react-stripe-checkout'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import { setScene, showMessage } from '../app/actions/app'
import { buyOther, getPurchaseData } from './actions'
import * as PaymentPropTypes from './proptypes'
import NewPaymentForm from './components/new-payment-form'

class NewPayment extends React.Component {
  static propTypes = {
    buyOther: PropTypes.func.isRequired,
    email: PropTypes.string,
    getPurchaseData: PropTypes.func.isRequired,
    params: PropTypes.shape({
      type: PropTypes.string.isRequired
    }).isRequired,
    people: ImmutablePropTypes.list,
    purchaseData: PaymentPropTypes.data,
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
      category: null,
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

  init({ params: { type }, purchaseData, replace, showMessage }) {
    const category = purchaseData.findKey(cd => cd.get('types').has(type));
    const typeData = purchaseData.getIn([category, 'types', type]);
    if (typeData) {
      this.setState({ amount: typeData.get('amount'), category });
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
    const { purchaseData } = this.props;
    const { category } = this.state;
    return purchaseData.getIn([category, 'shape'], Map()).filter(s => !s.get('generated'));
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
    const { params: { type }, purchaseData } = this.props;
    const { category } = this.state;
    return purchaseData.getIn([category, 'types', type, 'label']);
  }

  onCheckout = (token) => {
    const { buyOther, params: { type }, push, showMessage } = this.props;
    const { amount, category, purchase } = this.state;
    const item = purchase.merge({ amount, category, type }).filter(v => v).toJS();
    showMessage(`Charging ${purchase.get('email')} EUR ${amount / 100}...`);
    buyOther(token, [item], () => {
      showMessage('Payment successful!');
      push('/pay');
    });
  }

  render() {
    const { params: { type }, people, purchaseData } = this.props;
    if (!purchaseData) return null;
    const { amount, category, purchase, sent } = this.state;
    const title = this.title;
    const subtitle = category && category !== title ? category : '';
    const description = purchaseData.getIn([category, 'types', type, 'description']) ||
      purchaseData.getIn([category, 'description']);
    const variableAmount = purchaseData.getIn([category, 'variableAmount']);
    return (
      <Row>
        <Col
          xs={12}
          sm={8} smOffset={2}
          lg={6} lgOffset={3}
        >
          <Card>
            <CardHeader title={title} subtitle={subtitle} />
            <CardText>
              {description && <div
                className="html-container"
                style={{ marginBottom: 32, marginTop: -16 }}
                dangerouslySetInnerHTML={{ __html: description }}
              />}
              <NewPaymentForm
                disabled={purchaseData.getIn([category, 'disabled'])}
                onChange={(update) => this.setState({ purchase: purchase.merge(update) })}
                people={people}
                purchase={purchase}
                shape={this.dataShape}
              />
            </CardText>
            <CardActions style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', padding: 16 }}>
              <StripeCheckout
                amount={amount}
                closed={() => this.setState({ sent: false })}
                currency='EUR'
                description={title}
                email={purchase.get('email')}
                name={TITLE}
                stripeKey={STRIPE_KEY}
                token={this.onCheckout}
                triggerEvent='onTouchTap'
                zipCode={true}
              >
                <RaisedButton
                  label={ sent ? 'Working...' : 'Pay by card' }
                  disabled={this.disabledCheckout}
                  onTouchTap={() => this.setState({ sent: true })}
                  primary={true}
                  style={{ marginRight: 16 }}
                />
              </StripeCheckout>
              <div>
                Amount:
                <span style={{ paddingLeft: 8, paddingRight: 8 }}>€</span>
                {variableAmount ? (
                  <TextField
                    name="amount"
                    onChange={(ev, value) => {
                      const amount = value ? Math.floor(value * 100) : 0;
                      this.setState({ amount });
                    }}
                    style={{ height: 36, width: 80 }}
                    type="number"
                    value={amount > 0 ? (amount / 100).toFixed(2) : ''}
                  />
                ) : (
                  <span>{(amount / 100).toFixed(2)}</span>
                )}
              </div>
            </CardActions>
          </Card>
          <Link to="/pay"
            style={{
              display: 'block', fontSize: 14, marginLeft: 16, marginTop: 16,
              maxWidth: '45%', position: 'absolute'
            }}
          >&laquo; Return to the main payments page</Link>
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
)(NewPayment);
