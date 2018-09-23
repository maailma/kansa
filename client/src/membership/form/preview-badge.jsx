import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import api from '../../lib/api'

const BADGE_WIDTH = 709
const BADGE_HEIGHT = 299

const styles = {
  wrapper: {
    paddingBottom: ((100 * BADGE_HEIGHT) / BADGE_WIDTH).toFixed(2) + '%',
    position: 'relative',
    width: '100%'
  },
  image: {
    cursor: 'zoom-out',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%'
  }
}

const getBadgeImgSrc = member => {
  const memberId = member.get('id')
  const path = `badge/${memberId || 'blank'}`
  const name = member.get('badge_name') || member.get('preferred_name') || ''
  const subtitle = member.get('badge_subtitle') || member.get('country') || ''
  const params = name || subtitle ? { name, subtitle } : null
  return api.path(path, params)
}

export default class PreviewBadge extends Component {
  static propTypes = {
    buttonStyle: PropTypes.object,
    member: ImmutablePropTypes.map.isRequired
  }

  state = {
    isOpen: false
  }

  handleClose = () => this.setState({ isOpen: false })

  handleOpen = () => this.setState({ isOpen: true })

  render() {
    const { buttonStyle, member } = this.props
    const { isOpen } = this.state
    return (
      <Fragment>
        <FlatButton
          label="Preview"
          onClick={this.handleOpen}
          primary
          style={buttonStyle}
        />
        <Dialog
          bodyStyle={{ padding: 0 }}
          onRequestClose={this.handleClose}
          open={isOpen}
        >
          <div style={styles.wrapper}>
            {isOpen && (
              <img
                onClick={this.handleClose}
                src={getBadgeImgSrc(member)}
                style={styles.image}
              />
            )}
          </div>
        </Dialog>
      </Fragment>
    )
  }
}
