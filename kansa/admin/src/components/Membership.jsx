import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

export default class Membership extends React.Component {
  static propTypes = {
    membership: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    ok: React.PropTypes.func.isRequired
  }

  static types = [ 'NonMember', 'Supporter', 'KidInTow', 'Child', 'Youth', 'FirstWorldcon', 'Adult' ];

  state = {
    membership: null,
    comment: '',
    open: false,
    sent: false
  }

  handleOpen = () => { this.setState({
    membership: this.props.membership,
    open: true,
    sent: false
  }) }

  handleClose = () => { this.setState({ open: false }) }

  render() {
    const prevIdx = Membership.types.indexOf(this.props.membership);
    return (
      <div { ...this.props } >
        <RaisedButton label={this.props.membership} onTouchTap={this.handleOpen} />
        <Dialog
          title={ 'Upgrade ' + this.props.name }
          open={this.state.open}
          autoScrollBodyContent={true}
          onRequestClose={this.handleClose}
          actions={[
            <FlatButton key='cancel' label='Cancel' onTouchTap={this.handleClose} />,
            <FlatButton key='ok'
              label={ this.state.sent ? 'Working...' : 'Apply' }
              disabled={ this.state.sent || this.state.membership === this.props.membership || !this.state.comment }
              onTouchTap={ () => {
                this.setState({ sent: true });
                (this.props.ok(this.state) || Promise.reject('Membership expected a Promise from ok()'))
                  .then(this.handleClose);
                  // TODO: report errors here
              }}
            />
          ]}
        >
          <SelectField
            floatingLabelText='Membership type'
            floatingLabelFixed={true}
            value={this.state.membership}
            onChange={(ev, idx, membership) => { this.setState({ membership }) }}
          >
            { Membership.types.map(type => (
              <MenuItem key={type} value={type} primaryText={type}
                disabled={ Membership.types.indexOf(type) < prevIdx } />
            )) }
          </SelectField>
          <br />
          <TextField
            floatingLabelText='Comment'
            floatingLabelFixed={true}
            multiLine={true}
            fullWidth={true}
            textareaStyle={{ marginBottom: '-24px' }}
            value={this.state.comment}
            errorText={ this.state.membership === this.props.membership || this.state.comment
              ? '' : 'A comment is required for an upgrade' }
            onChange={ ev => this.setState({ comment: ev.target.value }) }
          />
        </Dialog>
      </div>
    );
  }
}
