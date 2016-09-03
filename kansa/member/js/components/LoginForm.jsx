import React from 'react'
import { routerShape, withRouter } from 'react-router'

import RaisedButton from 'material-ui/RaisedButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'


export default class LoginForm extends React.Component { 

  static propTypes = {
    onKeyLogin: React.PropTypes.func.isRequired,
    onKeyRequest: React.PropTypes.func.isRequired,
    router: routerShape.isRequired
  }

  state = {
    email: '',
    key: '',
    message: '',
    showMessage: false
  }

  showMessage(message) {
    this.setState({ message, showMessage: true });
  }

  handleLogin = () => {
    const { email, key } = this.state;
    this.props.onKeyLogin(email, key, this.props.router)
      .catch(err => {
        console.error('Login failed for', email, err);
        this.showMessage('Login failed: ' + (err.message || err.status));
      });
  }

  getKey = () => {
    const { email } = this.state;
    this.props.onKeyRequest(email)
      .then(res => this.showMessage('Login key and link sent to ' + email))
      .catch(err => {
        console.error('Key send failed for', email, err);
        this.showMessage('Key send failed: ' + (err.message || err.status));
      });
  }

  render() {
    const { email, key } = this.state;
    const validEmail = email && /.@.*\../.test(email);

    return <div>
      <form style={{ paddingTop: '1em' }}>
        <TextField
          id="email"
          fullWidth={true}
          floatingLabelText="Email"
          value={email}
          onChange={ev => this.setState({ email: ev.target.value })}
        />
        <TextField
          id="key"
          fullWidth={true}
          floatingLabelText="Key"
          value={key}
          onChange={ev => this.setState({ key: ev.target.value })}
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

export default withRouter(LoginForm);
