import { Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import MemberForm from '../../membership/components/MemberForm'
import { CommentField, CommonFields, UpgradeFields } from './form'
import { defaultMember } from './Member'

class NewMember extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    onAdd: PropTypes.func.isRequired
  }

  state = {
    member: Map(),
    open: false,
    sent: false
  }

  handleOpen = () => {
    this.setState({
      member: defaultMember.merge({ comment: '', membership: 'NonMember' }),
      open: true,
      sent: false
    })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { enabled, onAdd } = this.props
    const { member, open, sent } = this.state
    if (!enabled) return null
    let disabled = sent || !MemberForm.isValid(member)
    const formProps = {
      getDefaultValue: () => '',
      getValue: path => member.getIn(path, null),
      onChange: (path, value) =>
        this.setState({ member: member.setIn(path, value) })
    }
    return (
      <div>
        <FloatingActionButton
          onClick={this.handleOpen}
          style={{ position: 'fixed', bottom: '24px', right: '24px' }}
        >
          <ContentAdd />
        </FloatingActionButton>
        <Dialog
          title="Add new member"
          open={open}
          autoScrollBodyContent
          bodyClassName="memberDialog"
          onRequestClose={this.handleClose}
          actions={[
            <FlatButton
              key="cancel"
              label="Cancel"
              onClick={this.handleClose}
            />,
            <FlatButton
              key="add"
              label={sent ? 'Working...' : 'Add'}
              disabled={disabled}
              onClick={() => {
                this.setState({ sent: true })
                onAdd(member)
                  .then(res => {
                    console.log('New member added', res)
                    this.handleClose()
                  })
                  .catch(e => console.error('New member addition failed', e))
              }}
            />
          ]}
        >
          <CommonFields {...formProps} />
          <br />
          <UpgradeFields {...formProps} />
          <br />
          <CommentField {...formProps} />
        </Dialog>
      </div>
    )
  }
}

export default connect(({ registration, user }) => ({
  enabled: Boolean(user.get('member_admin') && !registration.get('locked'))
}))(NewMember)
