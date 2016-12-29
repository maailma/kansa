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
      <p>
        Thank you for participating in the nominations for the 2016 Hugo Awards and the John W. Campbell Award! This is
        your personal nominations ballot. You have received this link because you are a member of MidAmeriCon II,
        Worldcon 75 and/or Worldcon 76 in San José.
      </p>
      <p>
        Please choose up to five nominees in each category. We recommend that you nominate whatever works and creators
        you have personally read or seen that were your favorites from 2016.
      </p>
      <p>
        The deadline for nominations is 17 March 2017 at 2359 Pacific Daylight Time (0259 Eastern Daylight Time, 0659
        Greenwich Mean Time, 0859 in Finland, all on 18 March). You can make as many changes as you like up until then.
        Your current ballot will be emailed to you an hour after you stop making changes.
      </p>
      <p>
        If you have difficulties accessing the online ballot, or you have more general questions on the Hugo process,
        you can e-mail <a href="mailto:hugohelp@worldcon.fi">hugohelp@worldcon.fi</a> for assistance. See
        <a href="http://www.worldcon.fi/wsfs/hugo/" target="_blank">here</a> for more information about the Hugo Awards.
      </p>
      <p>
        To start nominating, please enter your name here:
      </p>

      <TextField
        floatingLabelText='Signature'
        onChange={ (event) => this.setState({ name: event.target.value }) }
        value={name}
      />
    </Dialog>
  }

}
