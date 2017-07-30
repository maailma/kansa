import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux';

import Member from './Member'
import MemberTable from './MemberTable'
import NewMember from './NewMember'
import Voter from './Voter'

class PeopleScene extends Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    filter: PropTypes.string,
    member: PropTypes.instanceOf(Map),
    onMemberSelect: PropTypes.func.isRequired,
    siteselection: PropTypes.bool
  }

  render () {
    const { api, filter, member, onMemberSelect, siteselection } = this.props
    return <div>
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
  }
}

export default connect(
  ({ user }) => ({
    siteselection: user.get('siteselection') || false
  })
)(PeopleScene)
