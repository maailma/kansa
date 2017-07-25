import { Map } from 'immutable'
import PropTypes from 'prop-types'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import { Tabs, Tab } from 'material-ui/Tabs'
import TextField from 'material-ui/TextField'
import PaymentsIcon from 'material-ui/svg-icons/action/euro-symbol'
import LockClosed from 'material-ui/svg-icons/action/lock-outline'
import ActionSearch from 'material-ui/svg-icons/action/search'
import ContentClear from 'material-ui/svg-icons/content/clear'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import PeopleIcon from 'material-ui/svg-icons/social/people'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import RegistrationLock from './RegistrationLock'

const SceneTabs = ({ onChange, value }) => (
  <Tabs
    inkBarStyle={{ position: 'absolute', bottom: 'auto', marginTop: 0, top: 0 }}
    onChange={onChange}
    value={value}
  >
    <Tab
      buttonStyle={{ color: 'rgba(0,0,0,0.4)', padding: '0 16px' }}
      icon={<PeopleIcon/>}
      style={{ color: 'rgba(0,0,0,0.4)' }}
      title="People"
      value="people"
    />
    <Tab
      buttonStyle={{ padding: '0 16px' }}
      icon={<PaymentsIcon/>}
      title="Payments"
      value="payments"
    />
  </Tabs>
)

class SearchBox extends Component {
  focus () {
    if (this.searchField) this.searchField.focus()
  }

  render () {
    const { filter, onChange } = this.props
    return (
      <ToolbarGroup style={{ flexGrow: 1 }}>
        <IconButton
          iconStyle={{ fill: `rgba(0, 0, 0, ${filter ? '0.6' : '0.4'})` }}
          tooltip={filter ? 'Clear search' : 'Search'}
          tooltipPosition='bottom-right'
          tooltipStyles={{ top: 24 }}
          onTouchTap={() => {
            if (filter) onChange('')
            if (this.searchField) this.searchField.focus()
          }}
        >
          { filter ? <ContentClear /> : <ActionSearch /> }
        </IconButton>
        <TextField
          hintText='Search'
          style={{ flexGrow: 1 }}
          underlineShow={false}
          value={filter}
          onChange={(_, value) => onChange(value)}
          ref={ref => { this.searchField = ref }}
        />
      </ToolbarGroup>
    )
  }
}

let ToolbarActions = class extends Component {
  render () {
    const { lockable, locked, onHelp, onLogout, onRegOptions, user } = this.props
    return (
      <ToolbarGroup lastChild={true}>
        <RegistrationLock
          ref={ref => { this.regLock = ref && ref.getWrappedInstance() }}
        >
          <IconButton><LockClosed /></IconButton>
        </RegistrationLock>
        {!locked ? (
          <IconMenu
            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          >
            <MenuItem primaryText={user.get('email')} disabled={true} />
            {lockable && <MenuItem primaryText="Lock for Registration"
              onTouchTap={() => this.regLock.lock()}
            />}
            <MenuItem primaryText="Registration options" onTouchTap={onRegOptions} />
            <MenuItem primaryText="Help" onTouchTap={onHelp} />
            <MenuItem primaryText="Logout" onTouchTap={onLogout} />
          </IconMenu>
        ) : null}
      </ToolbarGroup>
    )
  }
}

ToolbarActions = connect(
  ({ registration }) => ({
    locked: registration.get('locked') || false,
    lockable: !!registration.get('password')
  })
)(ToolbarActions)

export default class KansaToolbar extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    filter: PropTypes.string.isRequired,
    user: PropTypes.instanceOf(Map).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onHelp: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    onRegOptions: PropTypes.func.isRequired
  }

  focus () {
    if (this.searchBox) this.searchBox.focus()
  }

  render () {
    const { title, filter, user, onFilterChange, onHelp, onLogout, onRegOptions, onSceneChange, scene } = this.props
    return (
      <Toolbar
        style={{ position: 'fixed', zIndex: 1, height: 48, width: '100%', backgroundColor: 'rgb(221, 236, 148)' }}
      >
        <ToolbarGroup firstChild={true}>
          <ToolbarTitle text={title} style={{ lineHeight: '48px', marginLeft: 16, paddingRight: 16 }} />
        </ToolbarGroup>
        <ToolbarGroup>
          <SceneTabs onChange={onSceneChange} value={scene} />
        </ToolbarGroup>
        <SearchBox
          filter={filter}
          onChange={onFilterChange}
          ref={ref => { this.searchBox = ref }}
        />
        <ToolbarActions onHelp={onHelp} onLogout={onLogout} onRegOptions={onRegOptions} user={user} />
      </Toolbar>
    )
  }
}
