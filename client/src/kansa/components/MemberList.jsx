import { List } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setTitle } from '../../app/actions/app'
import MemberCard from './MemberCard'

class MemberList extends React.Component {

  static propTypes = {
    people: ImmutablePropTypes.list.isRequired,
    setTitle: React.PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.setTitle('Member Services')
  }

  componentWillUnmount() {
    this.props.setTitle('');
  }

  render() {
    const { people } = this.props;
    return <Row>
      <Col
        xs={12}
        smOffset={1} sm={10}
        mdOffset={2} md={8}
      >{
        people.map(member => <MemberCard
          key={member.get('id')}
          member={member}
          showHugoActions={
            member.get('can_hugo_nominate') &&
            people.filter(m => m.get('can_hugo_nominate')).size === 1
          }
        />)
      }</Col>
    </Row>;
  }
}

export default connect(
  (state) => ({
    people: state.user.get('people') || List()
  }), {
    setTitle
  }
)(MemberList);
