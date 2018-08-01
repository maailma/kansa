import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import Divider from 'material-ui/Divider'
import { List, ListItem, makeSelectable } from 'material-ui/List'
import EuroSymbol from 'material-ui/svg-icons/action/euro-symbol'
import ThumbUp from 'material-ui/svg-icons/action/thumb-up'
import People from 'material-ui/svg-icons/social/people'
import PersonAdd from 'material-ui/svg-icons/social/person-add'

import Rocket from '../../lib/rocket-icon'

const SelectableList = makeSelectable(List)

const singleWithKey = (currentMember, otherMembers, key) => (
  !currentMember || !currentMember.get(key) ? false
  : otherMembers ? otherMembers.every(m => !m.get(key))
  : true
)

const linkHugoNominations = (currentMember, otherMembers) => (
  singleWithKey(currentMember, otherMembers, 'hugo_nominator')
)

const linkHugoVotes = (currentMember, otherMembers) => (
  singleWithKey(currentMember, otherMembers, 'hugo_voter')
)

const NavMenu = ({ currentMember, handleNav, otherMembers }) => {
  const id = currentMember && currentMember.get('id')

  const memberItems = []
  if (linkHugoNominations(currentMember, otherMembers)) {
    memberItems.push(<ListItem
      key='hn'
      leftIcon={<Rocket />}
      primaryText='Nominate for the Hugo Awards'
      style={{ fontSize: 14 }}
      value={`/hugo/nominate/${id}`}
  />)
  }
  if (linkHugoVotes(currentMember, otherMembers)) {
    memberItems.push(<ListItem
      key='hv'
      leftIcon={<Rocket />}
      primaryText='Vote for the Hugo Awards'
      style={{ fontSize: 14 }}
      value={`/hugo/vote/${id}`}
  />)
  }
  if (memberItems.length) {
    memberItems.push(<Divider
      key='div'
      inset
      style={{ marginTop: 8, marginBottom: 8 }}
  />)
  }

  return <SelectableList onChange={(ev, val) => handleNav(val)}>
    { memberItems }
    <ListItem
      leftIcon={<People />}
      primaryText='My memberships'
      style={{ fontSize: 14 }}
      value='/'
    />
    <ListItem
      leftIcon={<PersonAdd />}
      primaryText='New Membership'
      style={{ fontSize: 14 }}
      value='/new'
    />
    <ListItem
      leftIcon={<ThumbUp />}
      primaryText='Upgrade Membership'
      style={{ fontSize: 14 }}
      value='/upgrade'
    />
    <ListItem
      leftIcon={<EuroSymbol />}
      primaryText='Payments'
      style={{ fontSize: 14 }}
      value='/pay'
    />
  </SelectableList>
}

NavMenu.propTypes = {
  currentMember: ImmutablePropTypes.map,
  handleNav: PropTypes.func.isRequired,
  otherMembers: ImmutablePropTypes.list
}

export default NavMenu
