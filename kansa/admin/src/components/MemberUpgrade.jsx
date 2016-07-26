import React from 'react'
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

export default class MemberUpgrade extends React.Component {
  static propTypes = {
    hasPaperPubs: React.PropTypes.bool.isRequired,
    membership: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    upgrade: React.PropTypes.func.isRequired
  }

  static types = [ 'NonMember', 'Supporter', 'KidInTow', 'Child', 'Youth', 'FirstWorldcon', 'Adult' ];

  state = {
    membership: null,
    paperPubs: null,
    comment: '',
    open: false,
    sent: false
  }

  handleOpen = () => { this.setState({
    membership: this.props.membership,
    paperPubs: null,
    open: true,
    sent: false
  }) }

  handleClose = () => { this.setState({ open: false }) }

  paperField(key) {
    const pp = this.state.paperPubs || {};
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const value = pp[key] || '';
    return (<TextField
      floatingLabelText={label}
      floatingLabelFixed={true}
      fullWidth={true}
      multiLine={ key == 'address' }
      value={value}
      errorText={ value ? '' : 'Required' }
      onChange={ ev => this.setState({
        paperPubs: Object.assign({}, pp, { [key]: ev.target.value })
      }) }
    />);
  }

  render() {
    const msChanged = this.state.membership !== this.props.membership;
    const pp = this.state.paperPubs;
    const ppValid = pp && pp.name && pp.address && pp.country;
    let disabled = this.state.sent || !this.state.comment;
    if (!disabled && !msChanged && !pp) disabled = true;
    if (!disabled && pp && !ppValid) disabled = true;
    const prevIdx = MemberUpgrade.types.indexOf(this.props.membership);
    return (
      <div { ...this.props } >
        <FlatButton label='Upgrade' onTouchTap={this.handleOpen} />
        <Dialog
          title={ 'Upgrade ' + this.props.name }
          open={this.state.open}
          autoScrollBodyContent={true}
          onRequestClose={this.handleClose}
          actions={[
            <FlatButton key='cancel' label='Cancel' onTouchTap={this.handleClose} />,
            <FlatButton key='ok'
              label={ this.state.sent ? 'Working...' : 'Apply' }
              disabled={disabled}
              onTouchTap={ () => {
                this.setState({ sent: true });
                const res = { comment: this.state.comment };
                if (msChanged) res.membership = this.state.membership;
                if (ppValid) res.paper_pubs = this.state.paperPubs;
                (this.props.upgrade(res) || Promise.reject('MemberUpgrade expected a Promise from upgrade()'))
                  .then(this.handleClose)
                  .catch(e => console.error(e));  // TODO: report errors better
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
            { MemberUpgrade.types.map((type, idx) => (
              <MenuItem
                key={type} value={type} primaryText={type}
                disabled={ idx < prevIdx }
              />
            )) }
          </SelectField>
          <Checkbox
            style={{ width: '256px', float: 'right', marginTop: '37px' }}
            label='Add paper publications'
            checked={!!this.state.paperPubs}
            disabled={this.props.hasPaperPubs}
            onCheck={ (ev, checked) => {
              this.setState({ paperPubs: checked ? { name: '', address: '', country: '' } : null })
            }}
          />
          <br />
          <table style={{ display: this.state.paperPubs ? 'table' : 'none', width: '100%' }}>
            <tbody><tr style={{ verticalAlign: 'top' }}>
              <td>{this.paperField('name')}</td>
              <td>{this.paperField('address')}</td>
              <td>{this.paperField('country')}</td>
            </tr></tbody>
          </table>
          <TextField
            floatingLabelText='Comment'
            floatingLabelFixed={true}
            multiLine={true}
            fullWidth={true}
            textareaStyle={{ marginBottom: '-24px' }}
            value={this.state.comment}
            errorText={ this.state.membership === this.props.membership && !this.state.paperPubs || this.state.comment
              ? '' : 'A comment is required for an upgrade' }
            onChange={ ev => this.setState({ comment: ev.target.value }) }
          />
        </Dialog>
      </div>
    );
  }
}
