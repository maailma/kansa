import React from 'react'
import { connect } from 'react-redux'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import { keyRequest } from '../actions/auth'

class KeyRequest extends React.Component {

  static propTypes = {
    keyRequest: React.PropTypes.func.isRequired,
  }

  state = {
    email: ''
  }

  componentDidMount() {
    this.focusRef && this.focusRef.focus();
  }

  render() {
    const { keyRequest } = this.props;
    const { email } = this.state;
    const validEmail = email && /.@.*\../.test(email);

    return <div>
      <Card>
        <CardHeader
          title="Request login link"
          style={{ fontWeight: 600 }}
        />
        <CardText>
          <div>
            To access our services, you'll need to use a login link sent to you
            via email. To request a new login link, please enter your email
            address below, and it'll be sent to you. The address you enter will
            need to match the one we have in our database for you; it's the one
            that you provided when signing up, and at which you've previously
            received messages from us.
          </div>
          <TextField
            id="email"
            fullWidth={true}
            floatingLabelText="Email"
            ref={ ref => this.focusRef = ref }
            value={email}
            onChange={ev => this.setState({ email: ev.target.value })}
          />
          <RaisedButton
            label="Send login link"
            fullWidth={true}
            primary={true}
            disabled={!validEmail}
            style={{ marginTop: 12 }}
            onTouchTap={() => keyRequest(email)}
          />
        </CardText>
      </Card>
      <div className="bg-text" style={{ fontSize: 14, marginBottom: 20, padding: '0 16px' }}>
        <p>
          If you're not able to enter a valid address, or if you do not receive
          the login link within 30 minutes or so, please get in touch with us at
          {' '}<a href="mailto:registration@worldcon.fi">registration@worldcon.fi</a>{' '}
          and we'll help you get sorted.
        </p><p>
          If your email address is associated with more than one membership that
          is eligible to nominate in the 2017 Hugo Awards, you'll need to use the
          separately emailed Hugo Nominations login link to access your
          nominations. For further assistance with Hugo nominations, please e-mail
          {' '}<a href="mailto:hugohelp@worldcon.fi">hugohelp@worldcon.fi</a>.
        </p>
      </div>
    </div>
  }
}

export default connect(null, { keyRequest })(KeyRequest);
