import PropTypes from 'prop-types'
import React from 'react'

import { List, ListItem, makeSelectable } from 'material-ui/List'
import EuroSymbol from 'material-ui/svg-icons/action/euro-symbol'
import ThumbUp from 'material-ui/svg-icons/action/thumb-up'
import People from 'material-ui/svg-icons/social/people'
import PersonAdd from 'material-ui/svg-icons/social/person-add'

const SelectableList = makeSelectable(List)

const NavMenu = ({ onChange }) => (
  <SelectableList onChange={onChange}>
    <ListItem
      leftIcon={<People />}
      primaryText="My memberships"
      style={{ fontSize: 14 }}
      value="/"
    />
    <ListItem
      leftIcon={<PersonAdd />}
      primaryText="New Membership"
      style={{ fontSize: 14 }}
      value="/new"
    />
    <ListItem
      leftIcon={<ThumbUp />}
      primaryText="Upgrade Membership"
      style={{ fontSize: 14 }}
      value="/upgrade"
    />
    <ListItem
      leftIcon={<EuroSymbol />}
      primaryText="Payments"
      style={{ fontSize: 14 }}
      value="/pay"
    />
  </SelectableList>
)

NavMenu.propTypes = {
  onChange: PropTypes.func.isRequired
}

export default NavMenu
