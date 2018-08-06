import PropTypes from 'prop-types'
import React from 'react'
import TextField from 'material-ui/TextField'

import { disabledColor, accent1Color } from '../theme/colors'
import messages from '../membership/messages'

const TextInput = ({
  getDefaultValue,
  getValue,
  inputRef,
  label,
  lc = 'en',
  onChange,
  path = [],
  required,
  style = {},
  ...props
}) => {
  if (!Array.isArray(path)) path = [path]
  const value = getValue(path)
  if (value === null) return null
  if (!label) {
    const fn = messages[lc][path]
    if (fn) {
      label = fn()
    } else {
      const ps = path.join(' ')
      label = ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ')
    }
  }
  if (required) label += ` (${messages[lc].required()})`
  const ulStyle = {}
  if (required && !value) {
    ulStyle.borderBottomWidth = 2
    ulStyle.borderColor = disabledColor
  } else if (getDefaultValue && value !== getDefaultValue(path)) {
    ulStyle.borderColor = accent1Color
  }
  return (
    <TextField
      floatingLabelText={label}
      floatingLabelFixed
      floatingLabelStyle={{
        color: value ? disabledColor : 'rgba(0, 0, 0, 0.870588)'
      }}
      fullWidth
      style={style}
      className="memberInput"
      underlineStyle={ulStyle}
      underlineFocusStyle={ulStyle}
      value={value}
      onChange={(ev, value) => onChange(path, value)}
      ref={inputRef || (() => {})}
      {...props}
    />
  )
}
TextInput.propTypes = {
  getDefaultValue: PropTypes.func,
  getValue: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
}

export default TextInput
