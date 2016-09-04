import React from 'react'
import { connect } from 'react-redux'

import Snackbar from 'material-ui/Snackbar'

import { hideMessage } from '../actions/app'

const App = ({ children, route: { title }, message, hideMessage }) => <div>
  <h1>{title}</h1>
  {children}
  <Snackbar
    open={!!message}
    message={message}
    onRequestClose={hideMessage}
  />
</div>;

export default connect(
  (state) => ({
    message: state.app.get('message')
  }), {
    hideMessage
  }
)(
  App
);
