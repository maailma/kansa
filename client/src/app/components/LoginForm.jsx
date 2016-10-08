import React from 'react'
import { connect } from 'react-redux'
import { routerShape, withRouter } from 'react-router'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import { keyLogin, keyRequest } from '../actions/auth'
import { PATH_IN } from '../../constants'

class LoginForm extends React.Component {

  static propTypes = {
    email: React.PropTypes.string,
    keyLogin: React.PropTypes.func.isRequired,
    keyRequest: React.PropTypes.func.isRequired,
    router: routerShape.isRequired
  }

  constructor(props) {
    super(props);
    const { email, router } = props;
    if (email) router.replace(PATH_IN);
    this.state = {
      email: '',
      key: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    const { email, router } = nextProps;
    if (email) router.replace(PATH_IN);
  }

  render() {
    const { keyLogin, keyRequest } = this.props;
    const { email, key } = this.state;
    const validEmail = email && /.@.*\../.test(email);

    return <form>
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
        onTouchTap={() => keyLogin(email, key)}
      />
      <RaisedButton
        label="Send login key"
        fullWidth={true}
        primary={true}
        disabled={!validEmail}
        style={{ margin: '12px 0' }}
        onTouchTap={() => keyRequest(email)}
      />
    </form>;
  }
}

export default connect(
  (state) => ({
    email: state.user.get('email')
  }), {
    keyLogin,
    keyRequest
  }
)(
  withRouter(LoginForm)
);
