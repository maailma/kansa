import { Map } from 'immutable';
import React from 'react';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import ActionSearch from 'material-ui/svg-icons/action/search';
import ContentClear from 'material-ui/svg-icons/content/clear';

let searchField = null;

const KansaToolbar = ({ filter = '', user, onFilterChange, onLogout }) => <Toolbar
  style={{ position: 'fixed', zIndex: 1, height: 48, width: '100%', backgroundColor: 'rgb(221, 236, 148)' }}
>
  <ToolbarGroup>
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
      style={{ width: 'calc(100vw - 120px)' }}
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
      <MenuItem primaryText="Logout" onTouchTap={onLogout} />
    </IconMenu>
  </ToolbarGroup>
</Toolbar>;

KansaToolbar.propTypes = {
  filter: React.PropTypes.string,
  user: React.PropTypes.instanceOf(Map).isRequired,
  onFilterChange: React.PropTypes.func.isRequired,
  onLogout: React.PropTypes.func.isRequired
}

export default KansaToolbar;
