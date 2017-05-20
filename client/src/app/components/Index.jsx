import { List } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setScene } from '../actions/app'
import KeyRequest from './KeyRequest'
import { getPrices } from '../../payments/actions'
import MemberCard from '../../membership/components/MemberCard'
import NewMemberCard from '../../membership/components/NewMemberCard'

class Index extends React.Component {

  static propTypes = {
    getPrices: React.PropTypes.func.isRequired,
    people: ImmutablePropTypes.list.isRequired,
    push: React.PropTypes.func.isRequired,
    setScene: React.PropTypes.func.isRequired
  }

  componentDidMount() {
    const { getPrices, prices, setScene } = this.props;
    setScene({ title: 'Memberships', dockSidebar: false });
    if (!prices) getPrices();
  }

  get memberCards() {
    const { people } = this.props;
    const hugoCount = people.reduce((sum, m) => (
      sum + (m.get('can_hugo_nominate') || m.get('can_hugo_vote') ? 1 : 0)
    ), 0);
    return people.map((member, key) => (
      <MemberCard
        key={key}
        member={member}
        showHugoActions={hugoCount === 1}
      />
    ));
  }

  render() {
    const { people, prices, push } = this.props
    const isLoggedIn = !!(people && people.size)
    const upgradePath = people && people.size === 1
      ? `/upgrade/${people.first().get('id')}` : '/upgrade/'
    return <Row style={{ marginBottom: -24 }}>
      <Col xs={12} sm={6} lg={4} lgOffset={2}>
        {isLoggedIn ? this.memberCards : <KeyRequest/>}
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <NewMemberCard
          category="all"
          expandable={true}
          onSelectType={(type) => push(`/new/${type}`)}
          prices={prices}
        />
        <NewMemberCard
          category="upgrade"
          disabled={!isLoggedIn}
          expandable={isLoggedIn}
          onSelectType={() => push(upgradePath)}
        />
      </Col>
    </Row>
  }
}

export default connect(
  ({ purchase, user }) => ({
    people: user.get('people') || List(),
    prices: purchase.get('prices')
  }), {
    getPrices,
    push,
    setScene
  }
)(Index);
