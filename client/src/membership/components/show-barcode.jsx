import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React from 'react'

import { API_ROOT } from '../../constants'

const BARCODE_WIDTH = 709
const BARCODE_HEIGHT = 551

const styles = {
  wrapper: {
    paddingBottom: (100 * BARCODE_HEIGHT / BARCODE_WIDTH).toFixed(2) + '%',
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

export default class ShowBarcode extends React.Component {
  static propTypes = {
    memberId: PropTypes.number.isRequired
  }

  state = {
    isOpen: false
  }

  barcodeUrl (fmt) {
    const { memberId } = this.props
    return `${API_ROOT}people/${memberId}/barcode.${fmt}`
  }

  handleClose = () => this.setState({ isOpen: false })

  handleOpen = () => this.setState({ isOpen: true })

  render () {
    const { memberId } = this.props
    const { isOpen } = this.state
    return <div>
      {React.Children.map(this.props.children, (child) => (
        React.cloneElement(child, { onClick: this.handleOpen })
      ))}
      <Dialog
        actions={
          <FlatButton
            download={`w75-barcode-${memberId}.pdf`}
            href={this.barcodeUrl('pdf')}
            label='Download PDF'
            primary
          />
        }
        bodyStyle={{ padding: 0 }}
        onRequestClose={this.handleClose}
        open={isOpen}
      >
        <div style={styles.wrapper}>
          {isOpen && <img
            onClick={this.handleClose}
            src={this.barcodeUrl('png')}
            style={styles.image}
          />}
        </div>
      </Dialog>
    </div>
  }
}
