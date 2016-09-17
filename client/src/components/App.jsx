import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import FlatButton from 'material-ui/FlatButton'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover'
import Snackbar from 'material-ui/Snackbar'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';

import { hideMessage } from '../actions/app'
import { logout } from '../actions/auth'
import { TITLE } from '../constants'

class ButtonMenu extends React.Component {
  static propTypes = {
    label: React.PropTypes.string
  }

  state = {
    anchorEl: null,
    open: false
  }

  menuItemTap = (action) => () => {
    this.setState({ open: false });
    if (action) action();
  }

  openMenu = (event) => {
    event.preventDefault();
    this.setState({
      anchorEl: event.currentTarget,
      open: true
    });
  }

  render = () => !this.props.label ? null : <div>
    <FlatButton
      onTouchTap={this.openMenu}
      label={this.props.label}
      labelStyle={{ color: 'rgba(0, 0, 0, 0.4)', textTransform: 'none', verticalAlign: 'initial' }}
      style={{ marginTop: 10 }}
    />
    <Popover
      open={this.state.open}
      anchorEl={this.state.anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      onRequestClose={ () => this.setState({ open: false }) }
    >
      <Menu>
        { React.Children.map(this.props.children, (child) => React.cloneElement(child, {
            onTouchTap: this.menuItemTap(child.props.onTouchTap)
        })) }
      </Menu>
    </Popover>
  </div>;
}

const App = ({ children, email, goHome, hideMessage, logout, message }) => <div>
   <Toolbar>
    <ToolbarGroup>
      <ToolbarTitle text={TITLE} />
    </ToolbarGroup>
    <ToolbarGroup>
      <ButtonMenu label={email}>
        <MenuItem primaryText="Home" onTouchTap={goHome} />
        <MenuItem primaryText="Sign out" onTouchTap={logout} />
      </ButtonMenu>
    </ToolbarGroup>
  </Toolbar>
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
  (state) => ({
    email: state.user.get('email'),
    message: state.app.get('message')
  }), {
    goHome: () => push('/'),
    hideMessage,
    logout
  }
)(
  App
);
