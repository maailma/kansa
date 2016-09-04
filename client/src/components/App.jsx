import React from 'react'
import { connect } from 'react-redux'

import Snackbar from 'material-ui/Snackbar'

import { hideMessage } from '../actions'

const App = ({ children, route: { title }, message, showMessage, hideMessage }) => <div>
  <h1>{title}</h1>
  {children}
  <Snackbar
    open={showMessage}
    message={message}
    onRequestClose={hideMessage}
  />
</div>;

export default connect(
  (state) => ({
    message: state.app.get('message'),
    showMessage: !!state.app.get('showMessage')
  }), {
    hideMessage
  }
)(
  App
);
