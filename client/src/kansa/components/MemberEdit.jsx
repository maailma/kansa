import { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
const ImmutablePropTypes = require('react-immutable-proptypes');
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

import { memberUpdate } from '../actions'
import MemberForm from './MemberForm'

class MemberEdit extends React.Component {

  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }).isRequired,
    memberUpdate: React.PropTypes.func.isRequired,
  }

  state = {
    changes: null,
    isOpen: false,
    sent: false
  }

  get canSaveChanges() {
    const { changes, isOpen, sent } = this.state;
    return isOpen && !sent && Map.isMap(changes) && changes.size > 0;
  }

  componentWillReceiveProps(nextProps) {
    const { isOpen, sent } = this.state;
    if (isOpen && sent && !nextProps.member.equals(this.props.member)) {
      this.handleClose();
    }
  }

  handleClose = () => this.setState({ isOpen: false });

  handleOpen = () => this.setState({
    changes: null,
    isOpen: true,
    sent: false
  });

  saveChanges = () => {
    const { member, memberUpdate } = this.props;
    const { changes } = this.state;
    if (this.canSaveChanges) {
      this.setState({ sent: true });
      memberUpdate(member.get('id'), changes);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.changes !== this.state.changes) return true;
    if (nextState.isOpen !== this.state.isOpen) return true;
    if (!nextProps.member.equals(this.props.member)) return true;
    return false;
  }

  render() {
    const { member, children } = this.props;
    const membership = member.get('membership', 'NonMember');
    const { isOpen } = this.state;

    return <div>
      { React.Children.map(children, (child) => React.cloneElement(child, { onTouchTap: this.handleOpen })) }
      <Dialog
        actions={[
          <FlatButton
            key='cancel'
            label='Cancel'
            onTouchTap={this.handleClose}
            primary={true}
          />,
          <FlatButton
            key='ok'
            disabled={!this.canSaveChanges}
            label='Save'
            onTouchTap={this.saveChanges}
            primary={true}
          />
        ]}
        autoScrollBodyContent={true}
        onRequestClose={this.handleClose}
        open={isOpen}
        title={ membership === 'NonMember'
          ? 'Edit non-member'
          : `Edit ${membership} member #${member.get('member_number')}` }
      >
        <MemberForm
          member={member}
          onChange={ (valid, changes) => {
            if (valid) this.setState({ changes });
          } }
        />
      </Dialog>
    </div>;
  }
}

export default connect(null, {
  memberUpdate
})(MemberEdit);
