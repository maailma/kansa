import React from 'react'
import { connect } from 'react-redux'

import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import Snackbar from 'material-ui/Snackbar'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';

import { hideMessage } from '../actions/app'
import { logout } from '../actions/auth'
import NavDrawer from './NavDrawer'

const AppBar = ({ email, id, logout, path, title }) => <Paper zDepth={2} >
  <Toolbar
    style={{
      backgroundColor: 'white'
    }}
  >
    <ToolbarGroup>
      <NavDrawer
        iconStyle={{ marginLeft: -24 }}
        id={id}
      />
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

const App = ({ children, email, hideMessage, location, logout, message, params: { id }, title }) => <div>
  { email ? <AppBar
    email={email}
    id={Number(id) || undefined}
    logout={logout}
    path={location.pathname}
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
    hideMessage,
    logout
  }
)(App);
