import PropTypes from 'prop-types'
import React from 'react'
import { Message } from 'react-message-context'

import { disabledColor } from '../theme/colors'

export const hintStyle = {
  color: disabledColor,
  fontSize: 13,
  marginBottom: 24
}

const HintText = ({ children, msgId, msgParams, ...props }) => (
  <div style={hintStyle} {...props}>
    {msgId && <Message id={msgId} params={msgParams} />}
    {children}
  </div>
)

HintText.propTypes = {
  msgId: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  msgParams: PropTypes.object
}

export default HintText
