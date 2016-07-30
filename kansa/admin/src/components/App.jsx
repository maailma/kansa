import { List, Map } from 'immutable';
import React from 'react';
import { connect } from 'react-redux';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import ActionSearch from 'material-ui/svg-icons/action/search';
import ContentClear from 'material-ui/svg-icons/content/clear';
import TextField from 'material-ui/TextField';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MenuItem from 'material-ui/MenuItem';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import filterPeople from '../filterPeople';
import MemberTable from './MemberTable';
import NewMember from './NewMember';

class App extends React.Component {
  static propTypes = {
    api: React.PropTypes.object.isRequired,
    people: React.PropTypes.instanceOf(List).isRequired,
    user: React.PropTypes.instanceOf(Map).isRequired
  }

  state = {
    filterSrc: ''
  }

  render() {
    const { api, user, people } = this.props;
    const { filterSrc } = this.state;
    const list = filterPeople(people, filterSrc);
    return <div>
      <Toolbar style={{ position: 'fixed', zIndex: 1, height: 48, width: '100%', backgroundColor: 'rgb(221, 236, 148)' }}>
        <ToolbarGroup>
          <IconButton
            iconStyle={{ fill: `rgba(0, 0, 0, ${filterSrc ? '0.6' : '0.4'})` }}
            tooltip={ filterSrc ? 'Clear search' : 'Search' }
            tooltipPosition='bottom-right'
            tooltipStyles={{ top: 24 }}
            onTouchTap={ () => {
              if (filterSrc) this.setState({ filterSrc: '' });
              if (this.searchField) this.searchField.focus();
            } }
          >
            { filterSrc ? <ContentClear /> : <ActionSearch /> }
          </IconButton>
          <TextField
            hintText='Search'
            style={{ width: 'calc(100vw - 120px)' }}
            underlineShow={false}
            value={filterSrc}
            onChange={ ev => this.setState({ filterSrc: ev.target.value }) }
            ref={ ref => { this.searchField = ref } }
          />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <IconMenu
            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          >
            <MenuItem primaryText={user.get('email')} disabled={true} />
            <MenuItem primaryText="Logout" onTouchTap={ () => {
              api.GET('logout')
                .then(res => location.reload())
                .catch(e => console.error('Logout failed', e));
            } } />
          </IconMenu>
        </ToolbarGroup>
      </Toolbar>

      <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
        <div style={{ flex: '1 1 auto' }}>
          <MemberTable api={api} list={list} />
        </div>
      </div>

      <NewMember add={ member => api.POST('people', member.toJS()) }>
        <FloatingActionButton style={{ position: 'fixed', bottom: '24px', right: '24px' }} >
          <ContentAdd />
        </FloatingActionButton>
      </NewMember>
    </div>;
  }
}

export default connect(state => state)(App);
