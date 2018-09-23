import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

import { ConfigConsumer, ConfigProvider } from '../../lib/config-context'
import { accent1Color } from '../../theme/colors'
import { memberUpdate } from '../actions'
import MemberForm from './MemberForm'

class MemberEdit extends Component {
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

  get canSaveChanges() {
    const { changes, isOpen, sent } = this.state
    return isOpen && !sent && Map.isMap(changes) && changes.size > 0
  }

  getTitle(attr) {
    const { member } = this.props
    return attr.member
      ? `Edit member #${member.get('member_number')}`
      : member.get('daypass')
        ? `Edit ${member.get('daypass')} day pass holder`
        : 'Edit non-member'
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
    if (this.canSaveChanges) {
      this.setState({ sent: true })
      memberUpdate(member.get('id'), changes)
    }
  }

  //shouldComponentUpdate(nextProps, nextState) {
  //  if (nextState.changes !== this.state.changes) return true
  //  if (nextState.isOpen !== this.state.isOpen) return true
  //  if (!nextProps.member.equals(this.props.member)) return true
  //  return false
  //}

  render() {
    const { member, children } = this.props
    const { isOpen } = this.state

    // FIXME: The material-ui 0.20 <Dialog> does not allow context to pass
    // through like it should; hence this Consumer/Dialog/Provider hack.
    return (
      <ConfigConsumer>
        {config => (
          <div>
            {React.Children.map(children, child =>
              React.cloneElement(child, { onClick: this.handleOpen })
            )}
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
                  disabled={!this.canSaveChanges}
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
                <MemberForm
                  lc={member.get('daypass') ? 'daypass' : 'en'}
                  member={member}
                  onChange={(valid, changes) => {
                    if (valid) this.setState({ changes })
                  }}
                  tabIndex={1}
                />
              </ConfigProvider>
            </Dialog>
          </div>
        )}
      </ConfigConsumer>
    )
  }
}

export default connect(
  null,
  {
    memberUpdate
  }
)(MemberEdit)
