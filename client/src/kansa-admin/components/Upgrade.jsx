import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import { UpgradeFields, CommentField } from './form'
import { paperPubsIsValid } from '../../membership/components/paper-pubs'

function getIn(obj, path, unset) {
  const val = obj[path[0]]
  if (val == null) return unset
  return path.length <= 1 ? val : val.getIn(path.slice(1), unset)
}

export default class Upgrade extends React.Component {
  static propTypes = {
    membership: PropTypes.string.isRequired,
    paper_pubs: ImmutablePropTypes.mapContains({
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired
    }),
    name: PropTypes.string.isRequired,
    upgrade: PropTypes.func.isRequired
  }

  state = {
    membership: null,
    paper_pubs: null,
    comment: '',
    open: false,
    sent: false
  }

  handleOpen = () => {
    this.setState({
      membership: this.props.membership,
      paper_pubs: null,
      open: true,
      sent: false
    })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  setStateIn = (path, value) => {
    const key = path[0]
    if (path.length > 1) value = this.state[key].setIn(path.slice(1), value)
    return this.setState({ [key]: value })
  }

  render() {
    const { children, membership: prevMembership, name, upgrade } = this.props
    const { comment, membership, paper_pubs, sent, open } = this.state
    const button = React.Children.only(children)
    const msChanged = membership !== prevMembership
    const disabled =
      sent ||
      !comment ||
      (!msChanged && !paper_pubs) ||
      !paperPubsIsValid(paper_pubs)
    const formProps = {
      getDefaultValue: path => getIn(this.props, path, null),
      getValue: path => getIn(this.state, path, ''),
      onChange: this.setStateIn
    }
    return (
      <div>
        {React.cloneElement(button, { onClick: this.handleOpen })}
        <Dialog
          bodyStyle={{ paddingLeft: 0 }}
          title={'Upgrade ' + name}
          open={open}
          autoScrollBodyContent
          onRequestClose={this.handleClose}
          actions={[
            <FlatButton
              key="cancel"
              label="Cancel"
              onClick={this.handleClose}
            />,
            <FlatButton
              key="ok"
              label={sent ? 'Working...' : 'Apply'}
              disabled={disabled}
              onClick={() => {
                this.setState({ sent: true })
                const res = { comment }
                if (msChanged) res.membership = membership
                if (paper_pubs) res.paper_pubs = paper_pubs.toJS()
                upgrade(res)
                  .then(res => {
                    console.log('Member upgraded', res)
                    this.handleClose()
                  })
                  .catch(err => {
                    console.error('Member upgrade failed!', err)
                    window.alert('Member upgrade failed! ' + err.message)
                  })
              }}
            />
          ]}
        >
          <UpgradeFields {...formProps} />
          <br />
          <CommentField {...formProps} />
        </Dialog>
      </div>
    )
  }
}
