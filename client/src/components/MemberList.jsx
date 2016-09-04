import React from 'react'
import { connect } from 'react-redux'

import Member from './Member'

const MemberList = ({ people = [] }) => <div>{
  people.map(member => <Member key={member.get('id')} member={member} />)
}</div>;

export default connect(
  (state) => ({
    people: state.user.get('people')
  })
)(MemberList);
