import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

class RegistrationLock extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    dispatch: PropTypes.func.isRequired,
    locked: PropTypes.bool,
    password: PropTypes.string
  }

  state = {
    error: null,
    open: false,
    password: ''
  }

  close = () => {
    this.setState({ error: null, open: false, password: '' })
  }

  open = () => {
    this.setState({ error: null, open: true, password: '' })
  }

  save (locked) {
    const { dispatch } = this.props
    try {
      localStorage.setItem('reg-lock', locked ? '1' : '')
      dispatch({ type: 'SET REG LOCK', locked })
    } catch (err) {
      console.error(err)
      alert('Reg lock save failed! ' + err.message)
    }
  }

  lock = () => {
    if (this.props.password) this.save(true)
  }

  unlock = () => {
    if (this.props.password === this.state.password) {
      this.save(false)
      this.close()
    } else {
      this.setState({ error: 'Wrong password', password: '' })
    }
  }

  componentDidUpdate (_, { open }) {
    if (this.state.open && !open) {
      setTimeout(() => {
        if (this.inputRef) this.inputRef.focus()
      }, 10)
    }
  }

  render () {
    const { children, locked } = this.props
    const { error, open, password } = this.state
    return locked ? (
      <div>
        {React.cloneElement(children, { onClick: this.open })}
        <Dialog
          actions={[
            <FlatButton key='cancel' label='Cancel' onClick={this.close} />,
            <FlatButton key='unlock' label='Unlock' onClick={this.unlock} />
          ]}
          onRequestClose={this.close}
          open={open}
        >
          <form onSubmit={ev => {
            ev.preventDefault()
            this.unlock()
          }}>
            <TextField
              errorText={error}
              floatingLabelFixed
              floatingLabelText='Password required for admin features'
              fullWidth
              onChange={(_, password) => this.setState({ password })}
              ref={ref => { this.inputRef = ref }}
              type='password'
              value={password}
            />
          </form>
        </Dialog>
      </div>
    ) : null
  }
}

export default connect(
  ({ registration }) => ({
    locked: registration.get('locked') || false,
    password: registration.get('password') || ''
  }), null, null, { withRef: true }
)(RegistrationLock)
