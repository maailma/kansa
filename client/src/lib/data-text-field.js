import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import messages from '../membership/messages'
import { disabledColor, accent1Color } from '../theme/colors'

const getLabel = (lc, path) => {
  const fn = messages[lc][path]
  if (fn) return fn()
  const ps = path.join(' ')
  return ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ')
}

const styles = {
  label: {
    default: { color: disabledColor },
    empty: { color: 'rgba(0, 0, 0, 0.870588)' }
  },
  underline: {
    changed: { borderColor: accent1Color },
    default: {},
    required: {
      borderBottomWidth: 2,
      borderColor: disabledColor
    }
  }
}

const DataTextField = ({
  data,
  inputRef,
  label,
  lc = 'en',
  onChange,
  path = [],
  prev,
  required,
  ...props
}) => {
  if (!Array.isArray(path)) path = [path]
  const value = data.getIn(path) || ''
  if (!label) label = getLabel(lc, path)
  if (required) label += ` (${messages[lc].required()})`
  const ulStyle =
    required && !value
      ? styles.underline.required
      : prev && value !== (prev.getIn(path) || '')
        ? styles.underline.changed
        : styles.underline.default
  return (
    <TextField
      className="memberInput"
      floatingLabelFixed
      floatingLabelStyle={value ? styles.label.default : styles.label.empty}
      floatingLabelText={label}
      fullWidth
      onChange={(ev, value) => onChange(data.setIn(path, value))}
      ref={inputRef}
      underlineFocusStyle={ulStyle}
      underlineStyle={ulStyle}
      value={value}
      {...props}
    />
  )
}

DataTextField.propTypes = {
  data: ImmutablePropTypes.map.isRequired,
  onChange: PropTypes.func.isRequired,
  path: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
  prev: ImmutablePropTypes.map
}

export default DataTextField
