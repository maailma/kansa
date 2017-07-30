import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import Member from './Member'
import MemberTable from './MemberTable'
import NewMember from './NewMember'
import Voter from './Voter'

const PeopleScene = ({ api, filter, member, onMemberSelect, siteselection }) => (
  <div>
    <MemberTable
      filter={filter}
      onMemberSelect={onMemberSelect}
    />
    {siteselection ? (
      <Voter
        api={api}
        member={member}
        onClose={() => onMemberSelect(null)}
      />
    ) : (
      <Member
        api={api}
        handleClose={() => onMemberSelect(null)}
        member={member}
      />
    )}
    <NewMember
      onAdd={member => api.POST('people', member.toJS())}
    />
  </div>
)

PeopleScene.propTypes = {
  api: PropTypes.object.isRequired,
  filter: PropTypes.string,
  member: PropTypes.instanceOf(Map),
  onMemberSelect: PropTypes.func.isRequired,
  siteselection: PropTypes.bool
}

export default connect(
  ({ user }) => ({
    siteselection: user.get('siteselection') || false
  })
)(PeopleScene)
