import { ListItem } from 'material-ui/List'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { showMessage } from '../app/actions/app'

class Action extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    primaryText: PropTypes.string.isRequired
  }

  handleClick = () => {
    const { onClick, showMessage } = this.props
    Promise.resolve(onClick())
      .then(res => res && showMessage(res))
      .catch(err => showMessage(err.message))
  }

  render() {
    const { onClick, showMessage, ...props } = this.props
    return (
      <ListItem
        innerDivStyle={{ paddingLeft: 60 }}
        onClick={this.handleClick}
        {...props}
      />
    )
  }
}

export default connect(
  null,
  { showMessage }
)(Action)
