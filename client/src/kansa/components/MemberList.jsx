import React from 'react'
import { connect } from 'react-redux'

import { memberUpdate } from '../actions'
import Member from './Member'

const MemberList = ({ memberUpdate, people = [] }) => <div>{
  people.map(member => <Member key={member.get('id')} member={member} onUpdate={memberUpdate} />)
}</div>;

export default connect(
  (state) => ({
    people: state.user.get('people')
  }), {
    memberUpdate
  }
)(MemberList);
