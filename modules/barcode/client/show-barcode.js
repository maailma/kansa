import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Receipt from 'material-ui/svg-icons/action/receipt'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import Action from '@kansa/client-lib/action'
import api from '@kansa/client-lib/api'

const BARCODE_WIDTH = 709
const BARCODE_HEIGHT = 551

const styles = {
  wrapper: {
    paddingBottom: ((100 * BARCODE_HEIGHT) / BARCODE_WIDTH).toFixed(2) + '%',
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

export default class ShowBarcode extends Component {
  static propTypes = {
    eventId: PropTypes.string.isRequired,
    memberId: PropTypes.number.isRequired
  }

  state = {
    isOpen: false
  }

  barcodeUrl(fmt) {
    const { memberId } = this.props
    return api.path(`barcode/${memberId}.${fmt}`)
  }

  handleClose = () => this.setState({ isOpen: false })

  handleOpen = () => this.setState({ isOpen: true })

  render() {
    const { eventId, memberId } = this.props
    const { isOpen } = this.state
    return (
      <div>
        <Action
          leftIcon={<Receipt />}
          onClick={this.handleOpen}
          primaryText="Show registration barcode"
        />
        <Dialog
          actions={
            <FlatButton
              download={`${eventId}-barcode-${memberId}.pdf`}
              href={this.barcodeUrl('pdf')}
              label="Download PDF"
              primary
            />
          }
          bodyStyle={{ padding: 0 }}
          onRequestClose={this.handleClose}
          open={isOpen}
        >
          <div style={styles.wrapper}>
            {isOpen && (
              <img
                onClick={this.handleClose}
                src={this.barcodeUrl('png')}
                style={styles.image}
              />
            )}
          </div>
        </Dialog>
      </div>
    )
  }
}
