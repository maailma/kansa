import { Map } from 'immutable';
import React from 'react';  
import { Link } from 'react-router';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';
import API from '../api.js';

export default class App extends React.Component { 

  static propTypes = {
    api: React.PropTypes.instanceOf(API).isRequired,
    user: React.PropTypes.instanceOf(Map).isRequired
  }

  state = {
    email: '',
    key: '',
    message: '',
    showMessage: false
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.get('member')) {
      this.redirectToProfile();
    }
  }

  showMessage(message) {
    this.setState({ message, showMessage: true });
  }

  handleEmailChange = ev => this.setState({ email: ev.target.value });

  handleKeyChange = ev => this.setState({ key: ev.target.value });

  handleLogin = () => {
    const { email, key } = this.state;
    this.props.api.GET('login', { email, key })
      .then(() => {
        location.reload()
      })
      .catch(e => {
        console.error('Login failed', e);
        this.showMessage('Login failed: ' + e.message);
      });
  }

  getKey = () => {
    const { email } = this.state;
    this.props.api.POST('key', { email })
      .then(res => {
        console.log('Login key and link sent', res);
        this.showMessage('Login key and link sent to ' + email);
      })
      .catch(e => {
        console.error('Key send failed', e);
        this.showMessage('Key send failed: ' + e.message);
      });
  }

  redirectToProfile() {
    window.location = '#/profile/';
  }

  validateLogin() {
    if(!this.state.email || !this.state.key) {
      msg = "Please fill out all fields";
      return false;
    }  
    return true;
  }

  render() {
    const { user } = this.props;
    const { email, key } = this.state;
    const validEmail = email && /.@.*\../.test(email);

    return <div>
      <hgroup>
        <h1>WORLDCON 75 LOGIN</h1>
      </hgroup>
      <form style={{ paddingTop: '1em' }}>
        <TextField
          id="email"
          fullWidth={true}
          floatingLabelText="Email"
          value={email}
          onChange={this.handleEmailChange}
        />
        <TextField
          id="key"
          fullWidth={true}
          floatingLabelText="Key"
          value={key}
          onChange={this.handleKeyChange}
        />
        <div style={{ height: 32 }} />
        <RaisedButton
          label="Login"
          fullWidth={true}
          primary={true}
          disabled={!validEmail || !key}
          style={{ margin: '12px 0' }}
          onTouchTap={this.handleLogin}
        />
        <RaisedButton
          label="Send login key"
          fullWidth={true}
          primary={true}
          disabled={!validEmail}
          style={{ margin: '12px 0' }}
          onTouchTap={this.getKey}
        />
      </form>
      <Snackbar
        open={this.state.showMessage}
        message={this.state.message}
        onRequestClose={ () => this.setState({ showMessage: false }) }
      />
    </div>
  }
}

export default connect(state => state)(App);
