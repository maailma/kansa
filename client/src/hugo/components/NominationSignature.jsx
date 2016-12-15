import React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

export default class NominationSignature extends React.Component {

  static propTypes = {
    setName: React.PropTypes.func.isRequired
  }

  state = { name: '' }

  render() {
    const { setName } = this.props;
    const { name } = this.state;
    return <Dialog
      actions={
        <FlatButton
          disabled={!name}
          label='OK'
          onTouchTap={ () => setName(name) }
        />
      }
      modal={true}
      open={true}
    >
      <p>Signature intro text here.</p>

      <TextField
        floatingLabelText='Signature'
        onChange={ (event) => this.setState({ name: event.target.value }) }
        value={name}
      />
    </Dialog>
  }

}
