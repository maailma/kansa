import React from 'react'
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

const LogCell = ({ entry, field }) => {
  let title = null, text = null
  switch (field) {
    case 'time':
      title = entry.timestamp
      text = title.slice(0, title.indexOf('T'))
      break
    case 'ID':
      text = entry.subject
      title = 'Log entry ' + entry.id
      break
    case 'author':
      title = entry.client_ua
      text = entry.author || ''
      break
    case 'description':
      text = entry.description || entry.action
      title = entry.action
      if (entry.parameters) title += '\n' + JSON.stringify(entry.parameters)
      break
    case 'parameters':
      text = JSON.stringify(entry.parameters || null)
      break
  }
  return <td title={title}>{text}</td>
}

export default class MemberLog extends React.Component {
  static propTypes = {
    getLog: React.PropTypes.func.isRequired,
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
    this.props.getLog(this.props.id)
      .then(log => { this.setState({ log }) })
      .catch(e => console.error(e));  // TODO: report errors better
  }

  handleClose = () => { this.setState({ open: false }) }

  render() {
    const button = React.Children.only(this.props.children)
    const log = this.state.log || []
    const columns = ['time', 'ID', 'author', 'description']
    return (
      <div>
        { React.cloneElement(button, { onTouchTap: this.handleOpen }) }
        <Dialog
          contentStyle={{ width: '95%', maxWidth: 'none' }}
          open={this.state.open}
          autoScrollBodyContent={true}
          onRequestClose={this.handleClose}
          actions={[
            <FlatButton key='close' label='Close' onTouchTap={this.handleClose} />,
          ]}
        >
          <table style={{ width: '100%' }}>
            <thead><tr style={{ textAlign: 'left', textTransform: 'capitalize' }}>
              { columns.map(col => <th key={col}>{col}</th>) }
            </tr></thead>
            <tbody>
              {
                log.map((entry, idx) => <tr key={idx}>{
                  columns.map((field, idx) => <LogCell
                    entry={entry}
                    field={field}
                    key={idx}
                  />)
                }</tr>)
              }
            </tbody>
          </table>
        </Dialog>
      </div>
    )
  }
}
