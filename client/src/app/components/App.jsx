import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import Snackbar from 'material-ui/Snackbar'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';

import { hideMessage } from '../actions/app'
import { logout } from '../actions/auth'

const AppBar = ({ email, logout }) => <Paper zDepth={2} >
  <Toolbar
    style={{
      backgroundColor: 'white'
    }}
  >
    <ToolbarGroup>
      <ToolbarTitle text={TITLE} />
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

const App = ({ children, email, hideMessage, logout, message }) => <div>
  { email ? <AppBar
    email={email}
    logout={logout}
  /> : null }
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
    message: app.get('message')
  }), {
    hideMessage,
    logout
  }
)(
  App
);
