import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import Snackbar from 'material-ui/Snackbar'
import ChevronLeftIcon from 'material-ui/svg-icons/navigation/chevron-left'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';

import { hideMessage } from '../actions/app'
import { logout } from '../actions/auth'

const AppBar = ({ email, goToProfiles, logout, path, title }) => <Paper zDepth={2} >
  <Toolbar
    style={{
      backgroundColor: 'white'
    }}
  >
    <ToolbarGroup>
      { path === '/profile' ? null : <IconButton
          onTouchTap={goToProfiles}
          style={{ marginLeft: -24 }}
          tooltip='Member details'
          tooltipPosition='bottom-right'
          tooltipStyles={{ marginTop: -8 }}
      >
        <ChevronLeftIcon />
      </IconButton> }
      <ToolbarTitle text={title} />
    </ToolbarGroup>
    <ToolbarGroup>
      <FlatButton
        className='logoutButton'
        label={<span><span className='logoutHint'>Sign out </span>{email}</span>}
        labelStyle={{ textTransform: 'none', verticalAlign: 'initial' }}
        onTouchTap={logout}
        primary={true}
        style={{ marginTop: 10 }}
      />
    </ToolbarGroup>
  </Toolbar>
</Paper>;

const App = ({ children, email, goToProfiles, hideMessage, location, logout, message, title }) => <div>
  { email ? <AppBar
    email={email}
    goToProfiles={goToProfiles}
    path={location.pathname}
    logout={logout}
    title={title}
  /> : <h1 style={{ paddingTop: 24 }}>{title}</h1> }
  <main>
    {children}
  </main>
  <Snackbar
    open={!!message}
    message={message}
    onRequestClose={hideMessage}
  />
</div>;

export default connect(
  ({ app, user }) => ({
    email: user.get('email'),
    message: app.get('message'),
    title: app.get('title')
  }), {
    goToProfiles: () => push('/profile'),
    hideMessage,
    logout
  }
)(
  App
);
