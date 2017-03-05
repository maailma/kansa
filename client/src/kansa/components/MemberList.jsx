import { List } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setTitle } from '../../app/actions/app'
import MemberCard from './MemberCard'

class MemberList extends React.Component {

  static propTypes = {
    people: ImmutablePropTypes.list.isRequired,
    push: React.PropTypes.func.isRequired,
    setTitle: React.PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.setTitle('Member Services')
  }

  componentWillUnmount() {
    this.props.setTitle('');
  }

  render() {
    const { people, push } = this.props;
    return <Row>
      {
        people.map(member => <Col
          xs={12} sm={6} lg={4}
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
        </Col>)
      }
    </Row>;
  }
}

export default connect(
  (state) => ({
    people: state.user.get('people') || List()
  }), {
    push,
    setTitle
  }
)(MemberList);
