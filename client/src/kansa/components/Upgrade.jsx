import React from 'react'
import { connect } from 'react-redux'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import StripeCheckout from 'react-stripe-checkout'

const ImmutablePropTypes = require('react-immutable-proptypes');

import { getPrices } from '../actions'
import { UpgradeFields } from './form-components';
import Member from './Member';

function getIn(obj, path, unset) {
  const val = obj[path[0]];
  if (typeof val === 'undefined') return unset;
  return path.length <= 1 ? val : val.getIn(path.slice(1), unset);
}

class Upgrade extends React.Component {
  static propTypes = {
    getPrices: React.PropTypes.func.isRequired,
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    prices: ImmutablePropTypes.map,
    style: React.PropTypes.object
  }

  state = {
    membership: null,
    paper_pubs: null,
    open: false,
    sent: false
  }

  handleOpen = () => {
    const { getPrices, prices } = this.props;
    this.setState({
      membership: this.props.member.get('membership'),
      paper_pubs: null,
      open: true,
      sent: false
    });
    if (!prices) getPrices();
  }

  handleClose = () => { this.setState({ open: false }) }

  onPurchase = (token) => {
    console.log('TODO: handle purchase', token);
    this.handleClose();
  }

  setStateIn = (path, value) => {
    const key = path[0];
    if (path.length > 1) value = this.state[key].setIn(path.slice(1), value);
    return this.setState({ [key]: value });
  }

  upgradeAmount(prev, next, paperPubs) {
    const { prices } = this.props;
    if (!prices) return 0;
    const prevAmount = prices.getIn(['memberships', prev, 'amount']) || 0;
    const nextAmount = prices.getIn(['memberships', next, 'amount']) || 0;
    const ppAmount = paperPubs && prices.getIn(['PaperPubs', 'amount']) || 0;
    return nextAmount - prevAmount + ppAmount;
  }

  render() {
    const { member, prices, style } = this.props;
    const prevMembership = member.get('membership');
    if (prevMembership === 'Adult' && member.get('paper_pubs')) return null;

    const { membership, paper_pubs, sent, open } = this.state;
    const button = React.Children.only(this.props.children);
    const amount = this.upgradeAmount(prevMembership, membership, paper_pubs);
    const disabled = sent || amount <= 0 || !Member.paperPubsIsValid(paper_pubs);
    const descriptions = [];
    if (membership !== prevMembership) descriptions.push(`${membership} upgrade`);
    if (paper_pubs) descriptions.push(prices.getIn(['PaperPubs', 'description']));

    return <div style={style}>
      { React.cloneElement(button, { onTouchTap: this.handleOpen }) }
      <Dialog
        title={ 'Upgrade ' + member.get('legal_name') }
        open={open}
        autoScrollBodyContent={true}
        onRequestClose={this.handleClose}
        actions={[
          <div key='total' style={{ color: 'rgba(0, 0, 0, 0.3)', flexGrow: 1, paddingLeft: 16 }}>
            Total: €{ amount / 100 }
          </div>,
          <FlatButton key='cancel' label='Cancel' onTouchTap={this.handleClose} />,
          <StripeCheckout
            key='pay'
            amount={amount}
            currency='EUR'
            description={ descriptions.join(' + ') || 'Member upgrade' }
            email={member.get('email')}
            name={TITLE}
            stripeKey={STRIPE_KEY}
            token={this.onPurchase}
            triggerEvent='onTouchTap'
            zipCode={true}
          >
            <FlatButton
              label={ sent ? 'Working...' : 'Pay by card' }
              disabled={disabled}
              onTouchTap={ () => this.setState({ sent: true }) }
              style={{ flexShrink: 0 }}
            />
          </StripeCheckout>
        ]}
        actionsContainerStyle={{ alignItems: 'center', display: 'flex', textAlign: 'left' }}
      >
        <UpgradeFields
          getDefaultValue={ path => member.getIn(path, null) }
          getValue={ path => getIn(this.state, path, '') }
          onChange={this.setStateIn}
          prices={prices}
        />
      </Dialog>
    </div>;
  }
}

export default connect(
  ({ purchase }) => ({
    prices: purchase.get('prices')
  }), {
    getPrices
  }
)(Upgrade);
