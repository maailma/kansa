import { Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import React, { PropTypes } from 'react'

import { API_ROOT } from '../../constants'

const BADGE_WIDTH = 709
const BADGE_HEIGHT = 299

const styles = {
  wrapper: {
    paddingBottom: (100 * BADGE_HEIGHT / BADGE_WIDTH).toFixed(2) + '%',
    position: 'relative',
    width: '100%'
  },
  image: {
    cursor: 'zoom-out',
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    width: '100%'
  }
}

export default class PreviewBadge extends React.Component {
  static propTypes = {
    memberId: PropTypes.number,
    name: PropTypes.string,
    subtitle: PropTypes.string
  }

  state = {
    isOpen: false
  }

  get badgeImgUrl() {
    const { memberId, name, subtitle } = this.props
    const q = []
    if (name) q.push(`name=${encodeURIComponent(name)}`)
    if (subtitle) q.push(`subtitle=${encodeURIComponent(subtitle)}`)
    const qs = q.length === 0 ? '' : '?' + q.join('&')
    return `${API_ROOT}people/${memberId||0}/badge${qs}`
  }

  handleClose = () => this.setState({ isOpen: false })

  handleOpen = () => this.setState({ isOpen: true })

  render() {
    const { isOpen } = this.state
    return <div>
      {React.Children.map(this.props.children, (child) => (
        React.cloneElement(child, { onTouchTap: this.handleOpen })
      ))}
      <Dialog
        bodyStyle={{ padding: 0 }}
        onRequestClose={this.handleClose}
        open={isOpen}
      >
        <div style={styles.wrapper}>
          {isOpen && <img
            onTouchTap={this.handleClose}
            src={this.badgeImgUrl}
            style={styles.image}
          />}
        </div>
      </Dialog>
    </div>
  }
}
