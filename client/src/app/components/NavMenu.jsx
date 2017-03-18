import React from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');

import Divider from 'material-ui/Divider'
import { List, ListItem, makeSelectable } from 'material-ui/List'
import Palette from 'material-ui/svg-icons/image/palette'
import People from 'material-ui/svg-icons/social/people'
import PersonAdd from 'material-ui/svg-icons/social/person-add'

import Rocket from '../../lib/rocket-icon'

const SelectableList = makeSelectable(List);

const singleWithKey = (currentMember, otherMembers, key) => (
  !currentMember || !currentMember.get(key) ? false
  : otherMembers ? otherMembers.every(m => !m.get(key))
  : true
);

const linkArtshowRegistration = (currentMember) => {
  const ms = currentMember && currentMember.get('membership');
  return ['Supporter', 'Youth', 'FirstWorldcon', 'Adult'].indexOf(ms) !== -1;
};

const linkHugoNominations = (currentMember, otherMembers) => (
  singleWithKey(currentMember, otherMembers, 'can_hugo_nominate')
);

const NavMenu = ({ currentMember, handleNav, otherMembers }) => {
  const id = currentMember && currentMember.get('id');

  const memberItems = [];
  if (linkHugoNominations(currentMember, otherMembers)) memberItems.push(<ListItem
    key="hn"
    leftIcon={<Rocket/>}
    primaryText="Nominate for the Hugo Awards"
    style={{ fontSize: 14 }}
    value={`/hugo/${id}/nominate`}
  />);
  if (linkArtshowRegistration(currentMember)) memberItems.push(<ListItem
    key="art"
    leftIcon={<Palette/>}
    primaryText="Register for the Art Show"
    style={{ fontSize: 14 }}
    value={`/exhibition/${id}`}
  />);
  if (memberItems.length) memberItems.push(<Divider
    key="div"
    inset={true}
    style={{ marginTop: 8, marginBottom: 8 }}
  />);

  return <SelectableList onChange={(ev, val) => handleNav(val)}>
    { memberItems }
    <ListItem
      leftIcon={<People/>}
      primaryText="My memberships"
      style={{ fontSize: 14 }}
      value="/"
    />
    <ListItem
      leftIcon={<PersonAdd/>}
      primaryText="New Membership"
      style={{ fontSize: 14 }}
      value="/new"
    />
  </SelectableList>;
};

NavMenu.propTypes = {
  currentMember: ImmutablePropTypes.map,
  handleNav: React.PropTypes.func.isRequired,
  otherMembers: ImmutablePropTypes.list
};

export default NavMenu;
