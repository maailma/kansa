import { Map } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import { Tabs, Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import PaymentsIcon from 'material-ui/svg-icons/action/euro-symbol'
import ActionSearch from 'material-ui/svg-icons/action/search'
import ContentClear from 'material-ui/svg-icons/content/clear'
import PeopleIcon from 'material-ui/svg-icons/social/people'

let searchField = null;

const KansaToolbar = ({ title, filter, user, onFilterChange, onHelp, onLogout, onRegOptions, onSceneChange, scene }) => <Toolbar
  style={{ position: 'fixed', zIndex: 1, height: 48, width: '100%', backgroundColor: 'rgb(221, 236, 148)' }}
>
  <ToolbarGroup firstChild={true}>
    <ToolbarTitle text={title} style={{ lineHeight: '48px', marginLeft: 16, paddingRight: 16 }} />
  </ToolbarGroup>
  <ToolbarGroup>
    <Tabs
      inkBarStyle={{ position: 'absolute', bottom: 'auto', marginTop: 0, top: 0 }}
      onChange={onSceneChange}
      value={scene}
    >
      <Tab buttonStyle={{ color: 'rgba(0,0,0,0.4)', padding: '0 16px' }} icon={<PeopleIcon/>} style={{ color: 'rgba(0,0,0,0.4)' }} title="People" value="people" />
      <Tab buttonStyle={{ padding: '0 16px' }} icon={<PaymentsIcon/>} title="Payments" value="payments" />
    </Tabs>
  </ToolbarGroup>
  <ToolbarGroup style={{ flexGrow: 1 }}>
    <IconButton
      iconStyle={{ fill: `rgba(0, 0, 0, ${filter ? '0.6' : '0.4'})` }}
      tooltip={ filter ? 'Clear search' : 'Search' }
      tooltipPosition='bottom-right'
      tooltipStyles={{ top: 24 }}
      onTouchTap={ () => {
        if (filter) onFilterChange('');
        if (searchField) searchField.focus();
      } }
    >
      { filter ? <ContentClear /> : <ActionSearch /> }
    </IconButton>
    <TextField
      hintText='Search'
      style={{ flexGrow: 1 }}
      underlineShow={false}
      value={filter}
      onChange={ ev => onFilterChange(ev.target.value) }
      ref={ ref => { searchField = ref } }
    />
  </ToolbarGroup>
  <ToolbarGroup lastChild={true}>
    <IconMenu
      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      <MenuItem primaryText={user.get('email')} disabled={true} />
      <MenuItem primaryText="Registration options" onTouchTap={onRegOptions} />
      <MenuItem primaryText="Help" onTouchTap={onHelp} />
      <MenuItem primaryText="Logout" onTouchTap={onLogout} />
    </IconMenu>
  </ToolbarGroup>
</Toolbar>;

KansaToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  filter: PropTypes.string.isRequired,
  user: PropTypes.instanceOf(Map).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onHelp: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onRegOptions: PropTypes.func.isRequired
}

export default KansaToolbar;
