import { List } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setScene } from '../actions/app'
import KeyRequest from './KeyRequest'
import { getPrices } from '../../kansa/actions'
import MemberCard from '../../kansa/components/MemberCard'
import NewMemberCard from '../../kansa/components/NewMemberCard'

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

  render() {
    const { people, prices, push } = this.props;
    return <Row>
      { people && people.size ? people.map(member => <Col
          xs={12} sm={6}
          lg={4} lgOffset={people.size > 1 ? 0 : 2}
          key={member.get('id')}
        >
          <MemberCard
            member={member}
            push={push}
            showHugoActions={
              member.get('can_hugo_nominate') &&
              people.filter(m => m.get('can_hugo_nominate')).size === 1
            }
          />
        </Col>) : <Col xs={12} sm={6} lg={4} lgOffset={2}>
          <KeyRequest/>
        </Col>}
      <Col xs={12} sm={6} lg={4}>
        <NewMemberCard category="all" prices={prices} push={push}/>
      </Col>
    </Row>;
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
