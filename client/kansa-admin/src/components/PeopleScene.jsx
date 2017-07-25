import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import Member from './Member'
import MemberTable from './MemberTable'
import NewMember from './NewMember'

export default class PeopleScene extends Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    filter: PropTypes.string,
    member: PropTypes.instanceOf(Map),
    onMemberSelect: PropTypes.func.isRequired
  }

  render () {
    const { api, filter, member, onMemberSelect } = this.props
    return <div>
      <MemberTable
        filter={filter}
        onMemberSelect={onMemberSelect}
      />
      <Member
        api={api}
        handleClose={() => onMemberSelect(null)}
        member={member}
      />
      <NewMember
        onAdd={member => api.POST('people', member.toJS())}
      />
    </div>
  }
}
