import { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
import { Card, CardActions, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
const { Col, Row } = require('react-flexbox-grid');
import StripeCheckout from 'react-stripe-checkout'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setTitle, showMessage } from '../../app/actions/app'
import { buyMembership, getPrices } from '../actions'
import { MembershipSelect } from './form-components'
import MemberForm from './MemberForm'

class NewMemberForm extends React.Component {
  static propTypes = {
    buyMembership: React.PropTypes.func.isRequired,
    email: React.PropTypes.string,
    getPrices: React.PropTypes.func.isRequired,
    prices: ImmutablePropTypes.map,
    params: React.PropTypes.shape({
      membership: React.PropTypes.string
    }).isRequired,
    push: React.PropTypes.func.isRequired,
    replace: React.PropTypes.func.isRequired,
    setTitle: React.PropTypes.func.isRequired,
    showMessage: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    const { email, getPrices, params: { membership }, prices } = this.props;
    this.state = {
      member: Map({ email, membership }),
      sent: false,
      valid: false
    };
    if (!prices) getPrices();
  }

  componentWillReceiveProps(nextProps) {
    const { email, params: { membership } } = nextProps;
    let { member } = this.state;
    if (email !== this.props.email) member = member.set('email', email);
    if (membership !== this.props.params.membership) member = member.set('membership', membership);
    if (!member.equals(this.state.member)) this.setState({ member });
  }

  componentDidMount() {
    this.props.setTitle('- New Membership')
  }

  componentWillUnmount() {
    this.props.setTitle('');
  }

  onCheckout = (token) => {
    const { buyMembership, push, showMessage } = this.props;
    const { member } = this.state;
    showMessage(`Charging ${token.email} EUR ${this.price/100} ...`);
    buyMembership(member, this.price, token, () => {
      showMessage('Charge completed; new member registered!');
      push('/');
    });
  }

  get description() {
    const { prices } = this.props;
    const { member } = this.state;
    const msDesc = prices && prices.getIn(['memberships', member.get('membership'), 'description']);
    const parts = [`New ${msDesc} member`];
    if (member.get('paper_pubs')) parts.push(prices.getIn(['PaperPubs', 'description']));
    return parts.join(' + ')
  }

  get price() {
    const { prices } = this.props;
    if (!prices) return 0;
    const { member } = this.state;
    const msAmount = prices.getIn(['memberships', member.get('membership'), 'amount']) || 0;
    const ppAmount = member.get('paper_pubs') && prices.getIn(['PaperPubs', 'amount']) || 0;
    return msAmount + ppAmount;
  }

  render() {
    const { prices, replace } = this.props;
    const { member, sent, valid } = this.state;

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
              <Col xs={12}>
                <MembershipSelect
                  getValue={ path => member.getIn(path) || ''}
                  onChange={ (path, value) => replace(`/new/${value}`) }
                  prices={prices}
                />
              </Col>
            </Row>
            <MemberForm
              member={member}
              newMember={true}
              onChange={ (valid, member) => this.setState({ member, valid }) }
              prices={prices}
              tabIndex={2}
            />
          </CardText>
          <CardActions>
            <FlatButton
              disabled={true}
              label={`Total: €${this.price / 100}`}
            />
            <StripeCheckout
              amount={this.price}
              currency='EUR'
              description={this.description}
              email={member.get('email')}
              name={TITLE}
              stripeKey={STRIPE_KEY}
              token={this.onCheckout}
              triggerEvent='onTouchTap'
              zipCode={true}
            >
              <FlatButton
                label={ sent ? 'Working...' : 'Pay by card' }
                disabled={ !valid || this.price <= 0 }
                onTouchTap={ () => this.setState({ sent: true }) }
                tabIndex={3}
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
    prices: purchase.get('prices')
  }), {
    buyMembership,
    getPrices,
    push,
    replace,
    setTitle,
    showMessage
  }
)(NewMemberForm);
