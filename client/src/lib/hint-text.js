import PropTypes from 'prop-types'
import React from 'react'
import { Message } from 'react-message-context'

import { disabledColor } from '../theme/colors'

export const hintStyle = {
  color: disabledColor,
  fontSize: 13,
  marginBottom: 24
}

const HintText = ({ children, msgId, ...props }) => (
  <div style={hintStyle} {...props}>
    {msgId && <Message id={msgId} />}
    {children}
  </div>
)

HintText.propTypes = {
  msgId: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
}

export default HintText
