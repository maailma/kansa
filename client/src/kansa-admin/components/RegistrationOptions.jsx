import { Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

const styles = {
  changed: { borderColor: 'rgb(255, 152, 0)' }
}

export const loadRegistrationState = () => {
  try {
    const regState = localStorage.getItem('reg-options')
    if (!regState) return undefined
    const { password, printer } = JSON.parse(regState)
    const locked = !!(password && localStorage.getItem('reg-lock'))
    return { registration: Map({ locked, password, printer }) }
  } catch (err) {
    return undefined
  }
}

class RegOptionsDialog extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    password: PropTypes.string,
    printer: PropTypes.string
  }

  constructor (props) {
    super(props)
    const { password, printer } = props
    this.state = { password, printer }
  }

  componentWillReceiveProps ({ password, printer }) {
    if (password !== this.state.password) this.setState({ password })
    if (printer !== this.state.printer) this.setState({ printer })
  }

  save = () => {
    const { dispatch, onClose } = this.props
    const { password, printer } = this.state
    try {
      const str = JSON.stringify({ password, printer })
      localStorage.setItem('reg-options', str)
      dispatch({ type: 'SET REG OPTIONS', password, printer })
      onClose()
    } catch (err) {
      console.error(err)
      alert('Reg options save failed! ' + err.message)
    }
  }

  render () {
    const { onClose, open } = this.props
    const { password, printer } = this.state
    const passwordChanged = this.props.password !== password
    const printerChanged = this.props.printer !== printer
    return (
      <Dialog
        actions={[
          <FlatButton key='close' label='Close' onTouchTap={onClose} />,
          <FlatButton
            disabled={!passwordChanged && !printerChanged || (!!printer && printer.indexOf('#') === -1)}
            key='apply'
            label='Apply'
            onTouchTap={this.save}
          />
        ]}
        open={open}
        autoScrollBodyContent
        onRequestClose={onClose}
      >
        <TextField
          floatingLabelFixed
          floatingLabelText='Password for accessing adming features'
          fullWidth
          onChange={(_, password) => this.setState({ password })}
          type='password'
          underlineFocusStyle={passwordChanged ? styles.changed : {}}
          underlineStyle={passwordChanged ? styles.changed : {}}
          value={password}
        />
        <TextField
          floatingLabelFixed
          floatingLabelText='Badge printer URI (server-path#printer-name)'
          fullWidth
          onChange={(_, printer) => this.setState({ printer })}
          underlineFocusStyle={printerChanged ? styles.changed : {}}
          underlineStyle={printerChanged ? styles.changed : {}}
          value={printer}
        />
      </Dialog>
    )
  }
}

export default connect(
  ({ registration }) => ({
    password: registration.get('password') || '',
    printer: registration.get('printer') || ''
  })
)(RegOptionsDialog)
