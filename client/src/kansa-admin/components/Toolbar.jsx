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
import LocationCity from 'material-ui/svg-icons/social/location-city'
import PeopleIcon from 'material-ui/svg-icons/social/people'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { HelpDialog } from './Help'
import RegistrationLock from './RegistrationLock'
import RegOptionsDialog from './RegistrationOptions'

const SceneTabs = ({ onChange, value }) => (
  <div style={{ position: 'relative' }}>
    <Tabs
      inkBarStyle={{ position: 'absolute', bottom: 'auto', marginTop: 0, top: 0 }}
      onChange={onChange}
      value={value}
    >
      <Tab
        buttonStyle={{ color: 'rgba(0,0,0,0.4)', padding: '0 16px' }}
        icon={<PeopleIcon />}
        style={{ color: 'rgba(0,0,0,0.4)' }}
        title='People'
        value='people'
      />
      <Tab
        buttonStyle={{ padding: '0 16px' }}
        icon={<PaymentsIcon />}
        title='Payments'
        value='payments'
      />
    </Tabs>
  </div>
)

class SearchBox extends Component {
  focus () {
    if (this.searchField) this.searchField.focus()
  }

  render () {
    const { filter, onChange, onSubmit } = this.props
    return (
      <ToolbarGroup style={{ flexGrow: 1 }}>
        <IconButton
          iconStyle={{ fill: `rgba(0, 0, 0, ${filter ? '0.6' : '0.4'})` }}
          tooltip={filter ? 'Clear search' : 'Search'}
          tooltipPosition='bottom-right'
          tooltipStyles={{ top: 24 }}
          onClick={() => {
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
          onFocus={ev => ev.target.select()}
          onKeyDown={({ key }) => {
            if (key === 'Enter') onSubmit()
          }}
          ref={ref => { this.searchField = ref }}
        />
      </ToolbarGroup>
    )
  }
}

let ToolbarActions = class extends Component {
  state = {
    helpOpen: false,
    regOpen: false
  }

  render () {
    const { email, lockable, locked, onLogout } = this.props
    const { helpOpen, regOpen } = this.state
    return (
      <ToolbarGroup lastChild>
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
            <MenuItem primaryText={email} disabled />
            {lockable && <MenuItem primaryText='Lock for Registration'
              onClick={() => this.regLock.lock()}
            />}
            <MenuItem primaryText='Registration options' onClick={() => this.setState({ regOpen: true })} />
            <MenuItem primaryText='Help' onClick={() => this.setState({ helpOpen: true })} />
            <MenuItem primaryText='Logout' onClick={onLogout} />
          </IconMenu>
        ) : null}
        <HelpDialog
          open={helpOpen}
          handleClose={() => this.setState({ helpOpen: false })}
        />
        <RegOptionsDialog
          onClose={() => this.setState({ regOpen: false })}
          open={regOpen}
        />
      </ToolbarGroup>
    )
  }
}

ToolbarActions = connect(
  ({ registration, user }) => ({
    email: user.get('email'),
    locked: registration.get('locked') || false,
    lockable: !!registration.get('password')
  })
)(ToolbarActions)

class KansaToolbar extends Component {
  static propTypes = {
    filter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired
  }

  focus () {
    if (this.searchBox) this.searchBox.focus()
  }

  render () {
    const { filter, onFilterChange, onLogout, onSceneChange, onSubmitFilter, scene, siteselection } = this.props
    return (
      <Toolbar
        style={{ position: 'fixed', zIndex: 1, height: 48, width: '100%', backgroundColor: 'rgb(221, 236, 148)' }}
      >
        {siteselection ? (
          <ToolbarGroup firstChild>
            <LocationCity style={{ color: 'rgba(0, 0, 0, 0.6)', padding: 12 }} />
            <ToolbarTitle
              style={{ lineHeight: '48px', paddingRight: 16 }}
              text='Site selection'
            />
          </ToolbarGroup>
        ) : (
          <ToolbarGroup firstChild>
            <ToolbarTitle
              style={{ lineHeight: '48px', paddingLeft: 16, paddingRight: 16 }}
              text={TITLE}
            />
            <SceneTabs onChange={onSceneChange} value={scene} />
          </ToolbarGroup>
        )}
        <SearchBox
          filter={filter}
          onChange={onFilterChange}
          onSubmit={onSubmitFilter}
          ref={ref => { this.searchBox = ref }}
        />
        {siteselection ? null : <ToolbarActions onLogout={onLogout} />}
      </Toolbar>
    )
  }
}

export default connect(
  ({ user }) => ({
    siteselection: !!user.get('siteselection')
  }), null, null, { withRef: true }
)(KansaToolbar)
