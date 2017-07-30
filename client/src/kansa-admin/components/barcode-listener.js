import React, { PropTypes, PureComponent } from 'react'

const BARCODE_MAX_TIME = 500

export default class BarcodeListener extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    onBarcode: PropTypes.func.isRequired,
    pattern: PropTypes.instanceOf(RegExp).isRequired
  }

  buffer = []
  timeout = null

  reset = () => {
    this.buffer = []
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }

  handleKeyDown = ({ altKey, ctrlKey, key, metaKey }) => {
    const { onBarcode, pattern } = this.props
    if (altKey || ctrlKey || metaKey) return
    if (key == 'Enter') {
      const code = this.buffer.join('')
      this.reset()
      if (pattern.test(code)) onBarcode(code)
    } else if (key.length === 1) {
      this.buffer.push(key)
      if (!this.timeout) this.timeout = setTimeout(this.reset, BARCODE_MAX_TIME)
    }
  }

  render () {
    return (
      <div onKeyDown={this.handleKeyDown}>
        {this.props.children}
      </div>
    )
  }
}
