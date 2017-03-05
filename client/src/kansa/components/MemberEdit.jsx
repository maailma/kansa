import { Map } from 'immutable'
import React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

const ImmutablePropTypes = require('react-immutable-proptypes');

import MemberForm from './MemberForm'

export default class Member extends React.Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
  }

  static defaultProps = {
    member: Map()
  }

  state = {
    canSubmit: false,
    form: null,
    isOpen: false
  }

  handleOpen = () => this.setState({ isOpen: true });
  handleClose = () => this.setState({ isOpen: false });

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.canSubmit !== this.state.canSubmit) return true;
    if (nextState.form !== this.state.form) return true;
    if (nextState.isOpen !== this.state.isOpen) return true;
    if (!nextProps.member.equals(this.props.member)) return true;
    return false;
  }

  render() {
    const { member, children } = this.props;
    const membership = member.get('membership', 'NonMember');
    const { canSubmit, form, isOpen } = this.state;

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
            disabled={ !canSubmit }
            label='Save'
            onTouchTap={() => {
              form && form.submit();
              this.handleClose();
            }}
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
          onChange={ (canSubmit) => this.setState({ canSubmit }) }
          setForm={ (form) => this.setState({ form }) }
        />
      </Dialog>
    </div>;
  }
}
