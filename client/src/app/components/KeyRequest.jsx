import React from 'react'
import { connect } from 'react-redux'
import { routerShape, withRouter } from 'react-router'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import { keyRequest } from '../actions/auth'
import { PATH_IN } from '../../constants'

class KeyRequest extends React.Component {

  static propTypes = {
    email: React.PropTypes.string,
    keyRequest: React.PropTypes.func.isRequired,
    router: routerShape.isRequired
  }

  state = {
    email: '',
    sent: false
  }

  componentWillReceiveProps(nextProps) {
    const { email, router } = nextProps;
    if (email) router.replace(PATH_IN);
  }

  render() {
    const { children, keyRequest } = this.props;
    const { email, sent } = this.state;
    const validEmail = email && /.@.*\../.test(email);

    return <form>
      <TextField
        id="email"
        fullWidth={true}
        floatingLabelText="Email"
        value={email}
        onChange={ev => this.setState({ email: ev.target.value })}
      />
      <RaisedButton
        label="Send login link"
        fullWidth={true}
        primary={true}
        disabled={!validEmail || sent}
        style={{ margin: '12px 0' }}
        onTouchTap={() => {
          keyRequest(email);
          this.setState({ sent: true });
        }}
      />
      { sent ? children : null }
    </form>
  }
}

export default connect(
  (state) => ({
    email: state.user.get('email')
  }), {
    keyRequest
  }
)(
  withRouter(KeyRequest)
);
