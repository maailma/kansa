import React from 'react'
import { connect } from 'react-redux'
import EventListener from 'react-event-listener'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import Snackbar from 'material-ui/Snackbar'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import Menu from 'material-ui/svg-icons/navigation/menu'

import Worldcon75 from '../../lib/worldcon75'
import { darkBlue, orange1 } from '../../theme'
import { hideMessage } from '../actions/app'
import { logout } from '../actions/auth'
import NavDrawer from './NavDrawer'

function getMenuState(allowMenuDocked) {
  const flexboxgridMd = () => window.matchMedia('(min-width: 64em)').matches;
  const flexboxgridLg = () => window.matchMedia('(min-width: 75em)').matches;
  const menuWidth = (cols) => Math.round(window.innerWidth * cols / 12);
  return !allowMenuDocked || !flexboxgridMd()
    ? { menuDocked: false, menuWidth: 256 }
    : {
        menuDocked: true,
        menuOpen: false,
        menuWidth: flexboxgridLg() ? menuWidth(2) : menuWidth(3)
      };
}

const AppBar = ({ email, logout, menuDocked, menuWidth, onOpenMenu, title }) => <Paper zDepth={2} >
  <Toolbar
    style={{
      backgroundColor: 'white',
      marginLeft: menuDocked ? menuWidth : 0,
      //transition: 'margin 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    }}
  >
    <ToolbarGroup firstChild={!menuDocked}>
      <IconButton
        disabled={menuDocked}
        iconStyle={menuDocked ? { width: 0 } : null}
        onTouchTap={onOpenMenu}
        style={menuDocked ? {
          border: 0,
          padding: 0,
          width: 0
        } : {
          paddingRight: 184
        }}
        tooltip='Navigation menu'
        tooltipPosition='bottom-right'
        tooltipStyles={{ marginTop: -8 }}
      >
        <Menu />
      </IconButton>
      <ToolbarTitle text={title} />
    </ToolbarGroup>
    <ToolbarGroup lastChild={true}>
      <FlatButton
        className='logoutButton'
        label={<span><span className='logoutHint'>Sign out </span>{email}</span>}
        labelStyle={{ color: darkBlue, textTransform: 'none', verticalAlign: 'initial' }}
        onTouchTap={logout}
        primary={true}
        style={{ marginTop: 10, marginRight: 10 }}
      />
    </ToolbarGroup>
  </Toolbar>
</Paper>;

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = Object.assign({ menuOpen: false }, getMenuState(props.allowMenuDocked));
  }

  componentWillReceiveProps(nextProps) {
    const { allowMenuDocked } = nextProps;
    if (allowMenuDocked !== this.state.allowMenuDocked) this.setState(getMenuState(allowMenuDocked))
  }

  handleResize = () => {
    this.setState(getMenuState(this.props.allowMenuDocked));
  }

  render() {
    const { allowMenuDocked, children, email, hideMessage, logout, message, params: { id }, title } = this.props;
    const { menuDocked, menuOpen, menuWidth } = this.state;

    return (
      <EventListener
        onResize={this.handleResize}
        target="window"
      >
        <div>
          { email ? [
            <Worldcon75 key="logo"
              className={menuOpen ? 'logo navbar' : 'logo'}
            />,
            <NavDrawer
              docked={menuDocked}
              id={Number(id) || undefined}
              key="nav"
              onRequestChange={(menuOpen) => this.setState({ menuOpen })}
              open={menuOpen}
              width={menuWidth}
            />,
            <AppBar
              email={email}
              key="top"
              logout={logout}
              menuDocked={menuDocked}
              menuWidth={menuWidth}
              onOpenMenu={() => this.setState({ menuOpen: true })}
              title={title}
            />
          ] : <h1 style={{ paddingTop: 24 }}>{title}</h1> }
          <main>
            {children}
          </main>
          <Snackbar
            open={!!message}
            message={message}
            onRequestClose={hideMessage}
          />
        </div>
      </EventListener>
    );
  }
}

export default connect(
  ({ app, user }) => ({
    allowMenuDocked: app.get('dockSidebar'),
    email: user.get('email'),
    message: app.get('message'),
    title: app.get('title')
  }), {
    hideMessage,
    logout
  }
)(App);
