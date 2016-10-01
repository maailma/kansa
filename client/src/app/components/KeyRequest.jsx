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
    email: ''
  }

  componentWillReceiveProps(nextProps) {
    const { email, router } = nextProps;
    if (email) router.replace(PATH_IN);
  }

  render() {
    const { keyRequest } = this.props;
    const { email } = this.state;
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
        <div style={{ height: 32 }} />
        <RaisedButton
          label="Send login link"
          fullWidth={true}
          primary={true}
          disabled={!validEmail}
          style={{ margin: '12px 0' }}
          onTouchTap={() => keyRequest(email)}
        />
      </form>
    </div>
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
