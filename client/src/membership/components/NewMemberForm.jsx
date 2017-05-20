import { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
import { Card, CardActions, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setScene, showMessage } from '../../app/actions/app'
import { buyMembership, getPrices } from '../../payments/actions'
import StripeCheckout from '../../payments/components/stripe-checkout'
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
    setScene: React.PropTypes.func.isRequired,
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
    this.props.setScene({ title: 'New Membership', dockSidebar: false });
  }

  onCheckout = (token) => {
    const { buyMembership, push, showMessage } = this.props;
    const { member } = this.state;
    const email = member.get('email');
    showMessage(`Charging ${email} EUR ${this.price/100} ...`);
    buyMembership(member, this.price, email, token, () => {
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
    const paymentDisabled = !valid || this.price <= 0;

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
          <CardActions style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 16, paddingBottom: 16 }}>
            <div style={{ color: 'rgba(0, 0, 0, 0.5)', paddingTop: 8, paddingRight: 16 }}>
              {this.price > 0 ? `Total: €${this.price / 100}` : ''}
            </div>
            <StripeCheckout
              amount={this.price}
              currency="EUR"
              description={this.description}
              disabled={paymentDisabled}
              email={member.get('email')}
              onCheckout={this.onCheckout}
              onClose={() => this.setState({ sent: false })}
            >
              <FlatButton
                label={ sent ? 'Working...' : 'Pay by card' }
                disabled={paymentDisabled}
                onTouchTap={ () => this.setState({ sent: true }) }
                style={{ flexShrink: 0 }}
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
    setScene,
    showMessage
  }
)(NewMemberForm);
