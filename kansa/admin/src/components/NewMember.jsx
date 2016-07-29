import { Map } from 'immutable';

import React from 'react'
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';

import Member from './Member';
import MemberForm from './MemberForm';

export default class NewMember extends React.Component {
  static propTypes = {
    add: React.PropTypes.func.isRequired
  }

  state = {
    member: Map(),
    open: false,
    sent: false
  }

  handleOpen = () => { this.setState({
    member: Member.defaultProps.member,
    open: true,
    sent: false
  }) }

  handleClose = () => { this.setState({ open: false }) }

  render() {
    const { member, open, sent } = this.state;
    const button = React.Children.only(this.props.children);
    let disabled = sent || !Member.isValid(member);
    return (
      <div>
        { React.cloneElement(button, { onTouchTap: this.handleOpen }) }
        <Dialog
          title='Add new member'
          open={open}
          autoScrollBodyContent={true}
          bodyClassName='memberDialog'
          onRequestClose={this.handleClose}
          actions={[
            <FlatButton key='cancel' label='Cancel' onTouchTap={this.handleClose} />,
            <FlatButton key='add'
              label={ sent ? 'Working...' : 'Add' }
              disabled={disabled}
              onTouchTap={ () => {
                this.setState({ sent: true });
                (this.props.add(member) || Promise.reject('NewMember expected a Promise from add()'))
                  .then(res => {
                    console.log('New member added', res);
                    this.handleClose();
                  })
                  .catch(e => console.error('New member addition failed', e));
              }}
            />
          ]}
        >
          <MemberForm
            getDefaultValue={ () => '' }
            getValue={ path => member.getIn(path, null) }
            onChange={ (path, value) => this.setState({ member: member.setIn(path, value) }) }
          />
        </Dialog>
      </div>
    );
  }
}
