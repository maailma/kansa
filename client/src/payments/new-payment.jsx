import { Map } from 'immutable'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push, replace } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import { setScene, showMessage } from '../app/actions/app'
import KeyRequest from '../app/components/KeyRequest'
import { buyOther, getPurchaseData } from './actions'
import * as PaymentPropTypes from './proptypes'
import NewPaymentForm from './components/new-payment-form'
import StripeCheckout from './components/stripe-checkout'

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
        person_id: people ? people.first().get('id') : null,
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

  onCheckout = (token) => {
    const { buyOther, params: { type }, purchaseData, push, showMessage } = this.props;
    const { amount, category, purchase } = this.state;
    const account = purchaseData.getIn([category, 'account'], 'default');
    const item = purchase.merge({ amount, category, type }).filter(v => v).toJS();
    showMessage(`Charging ${purchase.get('email')} EUR ${amount / 100}...`);
    buyOther(account, token, [item], () => {
      showMessage('Payment successful!');
      push('/pay');
    });
  }

  render() {
    const { params: { type }, people, purchaseData } = this.props;
    const { amount, category, purchase, sent } = this.state;
    const cd = purchaseData && purchaseData.get(category);
    if (!cd) return null;
    const title = cd.getIn(['types', type, 'label']);
    const subtitle = category && category !== title ? category : '';
    const description = cd.getIn(['types', type, 'description']) || cd.get('description');
    return (
      <Row>
        <Col
          xs={12}
          sm={8} smOffset={2}
          lg={6} lgOffset={3}
        >
          <Card>
            <CardHeader
              title={title}
              subtitle={subtitle}
              style={{ fontWeight: 600 }}
            />
            <CardText>
              {description && <div
                className="html-container"
                style={{ marginBottom: 32, marginTop: -16 }}
                dangerouslySetInnerHTML={{ __html: description }}
              />}
              <NewPaymentForm
                disabled={cd.get('disabled')}
                onChange={(update) => this.setState({ purchase: purchase.merge(update) })}
                people={people}
                purchase={purchase}
                requireMembership={cd.get('requireMembership')}
                shape={this.dataShape}
              />
            </CardText>
            <CardActions style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', padding: 16 }}>
              <StripeCheckout
                account={cd.get('account')}
                amount={amount}
                currency='EUR'
                description={title}
                email={purchase.get('email')}
                onCheckout={this.onCheckout}
                onClose={() => this.setState({ sent: false })}
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
                {cd.get('variableAmount') ? (
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
          {!people && <KeyRequest
            allowCreate={cd.get('allowCreate')}
            cardStyle={{ marginTop: 20 }}
          />}
          <div className="bg-text" style={{
            display: 'block', fontSize: 14, marginLeft: 16, marginTop: 16,
            maxWidth: '45%', position: 'absolute'
          }}>
            <Link to="/pay">&laquo; Return to the main payments page</Link>
          </div>
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
