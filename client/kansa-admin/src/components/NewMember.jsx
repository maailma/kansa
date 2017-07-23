import { Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { CommentField, CommonFields, UpgradeFields } from './form'
import Member from './Member'

class NewMember extends Component {
  static propTypes = {
    add: PropTypes.func.isRequired,
    locked: PropTypes.bool
  }

  state = {
    member: Map(),
    open: false,
    sent: false
  }

  handleOpen = () => { this.setState({
    member: Member.defaultProps.member.merge({ comment: '', membership: 'NonMember' }),
    open: true,
    sent: false
  }) }

  handleClose = () => { this.setState({ open: false }) }

  render() {
    const { add, children, locked } = this.props
    const { member, open, sent } = this.state
    if (locked) return null
    const button = React.Children.only(children)
    let disabled = sent || !Member.isValid(member)
    const formProps = {
      getDefaultValue: () => '',
      getValue: path => member.getIn(path, null),
      onChange: (path, value) => this.setState({ member: member.setIn(path, value) })
    }
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
                this.setState({ sent: true })
                (add(member) || Promise.reject('NewMember expected a Promise from add()'))
                  .then(res => {
                    console.log('New member added', res)
                    this.handleClose()
                  })
                  .catch(e => console.error('New member addition failed', e))
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
    )
  }
}

export default connect(
  ({ registration }) => ({
    locked: registration.get('locked') || false,
  })
)(NewMember)
