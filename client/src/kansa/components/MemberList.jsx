import { List } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setTitle } from '../../app/actions/app'
import KeyRequest from '../../app/components/KeyRequest'
import { getPrices } from '../actions'
import MemberCard from './MemberCard'
import NewMemberCard from './NewMemberCard'

class MemberList extends React.Component {

  static propTypes = {
    getPrices: React.PropTypes.func.isRequired,
    people: ImmutablePropTypes.list.isRequired,
    push: React.PropTypes.func.isRequired,
    setTitle: React.PropTypes.func.isRequired
  }

  componentDidMount() {
    const { getPrices, prices, setTitle } = this.props;
    setTitle('Memberships');
    if (!prices) getPrices();
  }

  componentWillUnmount() {
    this.props.setTitle('');
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
    setTitle
  }
)(MemberList);
