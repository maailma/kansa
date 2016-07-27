import React from 'react'
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

export default class MemberLog extends React.Component {
  static propTypes = {
    api: React.PropTypes.object.isRequired,
    id: React.PropTypes.number.isRequired
  }

  state = {
    log: null,
    open: false
  }

  componentWillReceiveProps(props) {
    if (this.state.log && props.id !== this.props.id) this.setState({ log: null });
  }

  handleOpen = () => {
    this.setState({ open: true });
    const { api, id } = this.props;
    if (id > 0) api.GET(`people/${id}/log`)
      .then(log => { this.setState({ log }) })
      .catch(e => console.error(e));  // TODO: report errors better
  }

  handleClose = () => { this.setState({ open: false }) }

  render() {
    const log = this.state.log || [];
    const columns = Object.keys(log[0] || {});
    return (
      <div { ...this.props } >
        <FlatButton label='View log' onTouchTap={this.handleOpen} />
        <Dialog
          open={this.state.open}
          autoScrollBodyContent={true}
          onRequestClose={this.handleClose}
          actions={[
            <FlatButton key='close' label='Close' onTouchTap={this.handleClose} />,
          ]}
        >
          <table style={{ width: '100%' }}>
            <thead><tr>
              { columns.map(col => <th key={col}>{col}</th>) }
            </tr></thead>
            <tbody>
              {
                log.map((entry, idx) => <tr key={idx}>{
                  columns.map((col, idx) => <td key={idx}>{ JSON.stringify(entry[col]) }</td>)
                }</tr>)
              }
            </tbody>
          </table>
        </Dialog>
      </div>
    );
  }
}
