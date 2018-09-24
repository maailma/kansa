import { Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { MessageProvider } from 'react-message-context'

import { ConfigConsumer, ConfigProvider } from '../../lib/config-context'
import { accent1Color } from '../../theme/colors'
import { memberUpdate } from '../actions'
import messages from '../messages'
import MemberForm from './MemberForm'
import MemberEditActionButton from './member-edit-action-button'

class MemberEditAction extends Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }).isRequired,
    memberUpdate: PropTypes.func.isRequired
  }

  state = {
    changes: null,
    isOpen: false,
    sent: false
  }

  canSaveChanges() {
    const { changes, isOpen, sent } = this.state
    return isOpen && !sent && Map.isMap(changes) && changes.size > 0
  }

  getTitle(attr) {
    const { member } = this.props
    if (attr.member) return `Edit member #${member.get('member_number')}`
    const dp = member.get('daypass')
    return dp ? `Edit ${dp} day pass holder` : 'Edit non-member'
  }

  componentWillReceiveProps(nextProps) {
    const { isOpen, sent } = this.state
    if (isOpen && sent && !nextProps.member.equals(this.props.member)) {
      this.handleClose()
    }
  }

  handleClose = () => this.setState({ isOpen: false })

  handleOpen = () =>
    this.setState({
      changes: null,
      isOpen: true,
      sent: false
    })

  saveChanges = () => {
    const { member, memberUpdate } = this.props
    const { changes } = this.state
    if (this.canSaveChanges()) {
      this.setState({ sent: true })
      memberUpdate(member.get('id'), changes)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.changes !== this.state.changes) return true
    if (nextState.isOpen !== this.state.isOpen) return true
    if (!nextProps.member.equals(this.props.member)) return true
    if (nextProps.config !== this.props.config) return true
    return false
  }

  render() {
    const { config, member } = this.props
    const { isOpen } = this.state
    const lc = member.get('daypass') ? 'daypass' : 'en'

    // FIXME: The material-ui 0.20 <Dialog> does not allow context to pass
    // through like it should; hence this Consumer/Dialog/Provider hack.
    return (
      <div>
        <MemberEditActionButton
          badge={config.modules && config.modules.badge}
          member={member}
          onClick={this.handleOpen}
        />
        <Dialog
          actions={[
            <FlatButton
              key="cancel"
              label="Cancel"
              onClick={this.handleClose}
              primary
              tabIndex={3}
            />,
            <FlatButton
              key="ok"
              disabled={!this.canSaveChanges()}
              label="Save"
              onClick={this.saveChanges}
              primary
              tabIndex={2}
            />
          ]}
          autoScrollBodyContent
          onRequestClose={this.handleClose}
          open={isOpen}
          title={this.getTitle(config.getMemberAttr(member))}
          titleStyle={{ color: accent1Color, textShadow: 'none' }}
        >
          <ConfigProvider value={config}>
            <MessageProvider fallback="en" locale={lc} messages={messages}>
              <MemberForm
                lc={lc}
                member={member}
                onChange={(valid, changes) => {
                  if (valid) this.setState({ changes })
                }}
                tabIndex={1}
              />
            </MessageProvider>
          </ConfigProvider>
        </Dialog>
      </div>
    )
  }
}

export default connect(
  null,
  {
    memberUpdate
  }
)(props => (
  <ConfigConsumer>
    {config => <MemberEditAction {...props} config={config} />}
  </ConfigConsumer>
))
