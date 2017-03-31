import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
import { Card, CardActions, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
const { Col, Row } = require('react-flexbox-grid');
import StripeCheckout from 'react-stripe-checkout'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setScene, showMessage } from '../../app/actions/app'
import { buyUpgrade, getPrices } from '../../payments/actions'
import * as PaymentPropTypes from '../../payments/proptypes'
import * as MemberPropTypes from '../proptypes'
import MemberLookupSelector from './MemberLookupSelector'
import MemberTypeList from './MemberTypeList'
import { AddPaperPubs, paperPubsIsValid } from './paper-pubs';

function getIn(obj, path, unset) {
  const val = obj[path[0]];
  if (typeof val === 'undefined') return unset;
  return path.length <= 1 ? val : val.getIn(path.slice(1), unset);
}

class Upgrade extends React.Component {
  static propTypes = {
    buyUpgrade: PropTypes.func.isRequired,
    email: PropTypes.string,
    getPrices: PropTypes.func.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string
    }).isRequired,
    people: MemberPropTypes.people,
    prices: PaymentPropTypes.prices,
    push: React.PropTypes.func.isRequired,
    replace: React.PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    showMessage: React.PropTypes.func.isRequired
  }

  static getPerson(props) {
    const id = Number(props.params.id);
    return id && props.people && props.people.find(p => p.get('id') === id) || null;
  }

  constructor(props) {
    super(props);
    const person = Upgrade.getPerson(props);
    const prevMembership = person && person.get('membership') || null;
    this.state = {
      canAddPaperPubs: false,
      membership: null,
      paperPubs: null,
      prevMembership,
      sent: false
    }
  }

  componentWillMount() {
    const { getPrices, prices, setScene } = this.props;
    if (!prices) getPrices();
    setScene({ title: 'Upgrade Membership', dockSidebar: false });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      const nextState = {};
      const person = Upgrade.getPerson(nextProps);
      if (person) {
        nextState.prevMembership = person.get('membership');
        if (!this.canUpgrade(nextState.prevMembership, this.state.membership)) nextState.membership = null;
        const cap = nextState.canAddPaperPubs = !person.get('paper_pubs');
        if (!cap) nextState.paperPubs = null;
      } else {
        nextState.canAddPaperPubs = false;
        nextState.paperPubs = null;
      }
      this.setState(nextState);
    }
  }

  get amount() {
    const { prices } = this.props;
    const { membership, paperPubs, prevMembership } = this.state;
    if (!prices) return 0;
    const prevAmount = prices.getIn(['memberships', prevMembership, 'amount']) || 0;
    const nextAmount = prices.getIn(['memberships', membership, 'amount']) || 0;
    const ppAmount = paperPubs && prices.getIn(['PaperPubs', 'amount']) || 0;
    return nextAmount - prevAmount + ppAmount;
  }

  canUpgrade(src, tgt) {
    const { prices } = this.props;
    if (!prices) return false;
    const srcAmount = prices.getIn(['memberships', src, 'amount']) || 0;
    const tgtAmount = prices.getIn(['memberships', tgt, 'amount']) || 0;
    return tgtAmount > srcAmount;
  }

  get description() {
    const { prices } = this.props;
    const { membership, paperPubs, prevMembership } = this.state;
    const parts = [];
    if (membership !== prevMembership) parts.push(`Upgrade to ${membership}`);
    if (paperPubs) parts.push(prices.getIn(['PaperPubs', 'description']));
    return parts.join(' + ') || 'Member upgrade';
  }

  get disabledCheckout() {
    const { paperPubs, sent } = this.state;
    return sent || this.amount <= 0 || !paperPubsIsValid(paperPubs);
  }

  get id() {
    return Number(this.props.params.id) || 0;
  }

  get person() {
    const { people } = this.props;
    const id = this.id;
    return id && people && people.find(p => p.get('id') === id) || null;
  }

  onSelectMember = ({ membership, person_id }) => {
    if (person_id !== this.id) {
      this.setState({ prevMembership: membership });
      this.props.replace(person_id ? `/upgrade/${person_id}` : '/upgrade');
    }
  }

  onPaperPubsChange = ([pp, key], value) => {
    if (key) {
      this.setState({ paperPubs: this.state.paperPubs.set(key, value) })
    } else {
      this.setState({ paperPubs: value });
    }
  }

  onPurchase = (amount, token) => {
    const { buyUpgrade, email, push, showMessage } = this.props;
    const { membership, paperPubs } = this.state;
    showMessage(`Charging ${email} EUR ${amount/100} for upgrade...`);
    buyUpgrade(this.id, membership, paperPubs, amount, token, () => {
      showMessage('Payment successful!');
      push('/');
    });
  }

  setStateIn = (path, value) => {
    const key = path[0];
    if (path.length > 1) value = this.state[key].setIn(path.slice(1), value);
    return this.setState({ [key]: value });
  }

  render() {
    const { email, people, prices } = this.props;
    if (!people) return null;
    const { canAddPaperPubs, membership, paperPubs, prevMembership } = this.state;
    const amount = this.amount;
    return <Row>
      <Col
        xs={12}
        sm={10} smOffset={1}
        lg={8} lgOffset={2}
        style={{ paddingTop: 20 }}
      >
        <Card>
          <CardText>
            <Row>
              <Col xs={12} sm={6}>
                <div>
                  Membership to upgrade:
                </div>
                <MemberLookupSelector
                  onChange={this.onSelectMember}
                  people={people}
                  selectedPersonId={this.id}
                />
              </Col>
              <Col xs={12} sm={6}>
                <div>
                  Upgrade to:
                </div>
                  <MemberTypeList
                    memberTypes={['Adult', 'Youth', 'FirstWorldcon', 'Child']}
                    onSelectType={(membership) => this.setState({ membership })}
                    prevType={prevMembership}
                    prices={prices}
                    selectedType={membership}
                  />
              </Col>
            </Row>
            {canAddPaperPubs ? (
              <AddPaperPubs
                getValue={([pp, key]) => key ? paperPubs.get(key) : paperPubs}
                onChange={this.onPaperPubsChange}
                prices={prices}
                tabIndex={1}
            ) : null}
          </CardText>
          <CardActions style={{ alignItems: 'center', display: 'flex', textAlign: 'left' }}>
            <div style={{ color: 'rgba(0, 0, 0, 0.3)', flexGrow: 1, paddingLeft: 16 }}>
              Total: €{ amount / 100 }
            </div>
            <StripeCheckout
              amount={amount}
              currency="EUR"
              description={this.description}
              email={email}
              name={TITLE}
              stripeKey={STRIPE_KEY}
              token={(token) => this.onPurchase(amount, token)}
              triggerEvent="onTouchTap"
              zipCode={true}
            >
              <FlatButton
                label={ sent ? 'Working...' : 'Pay by card' }
                disabled={this.disabledCheckout}
                onTouchTap={() => this.setState({ sent: true })}
                style={{ flexShrink: 0 }}
                tabIndex={2}
              />
            </StripeCheckout>
          </CardActions>
        </Card>
      </Col>
    </Row>;
  }
}

export default connect(
  ({ purchase, user }) => ({
    email: user.get('email'),
    people: user.get('people'),
    prices: purchase.get('prices')
  }), {
    buyUpgrade,
    getPrices,
    push,
    replace,
    setScene,
    showMessage
  }
)(Upgrade);
