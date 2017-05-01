import { Map } from 'immutable';
import PropTypes from 'prop-types'
import React from 'react'
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';

import { CommentField, CommonFields, UpgradeFields } from './form';
import Member from './Member';

export default class NewMember extends React.Component {
  static propTypes = {
    add: PropTypes.func.isRequired
  }

  state = {
    member: Map(),
    open: false,
    sent: false
  }

  handleOpen = () => { this.setState({
    member: Member.defaultProps.member.set('comment', ''),
    open: true,
    sent: false
  }) }

  handleClose = () => { this.setState({ open: false }) }

  render() {
    const { member, open, sent } = this.state;
    const button = React.Children.only(this.props.children);
    let disabled = sent || !Member.isValid(member);
    const formProps = {
      getDefaultValue: () => '',
      getValue: path => member.getIn(path, null),
      onChange: (path, value) => this.setState({ member: member.setIn(path, value) })
    };
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
          <CommonFields { ...formProps } />
          <br />
          <UpgradeFields { ...formProps } />
          <br />
          <CommentField { ...formProps } />
        </Dialog>
      </div>
    );
  }
}
