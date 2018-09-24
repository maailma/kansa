import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Message } from 'react-message-context'

import { disabledColor, accent1Color } from '../theme/colors'

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

const Label = ({ label, path, required }) => (
  <Message id={path}>
    {msgLabel => {
      if (!label) {
        if (msgLabel) {
          label = msgLabel()
        } else {
          const ps = path.join(' ')
          label = ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ')
        }
      }
      return required ? <Message id="required_label" label={label} /> : label
    }}
  </Message>
)

const DataTextField = ({
  data,
  inputRef,
  label,
  onChange,
  path = [],
  prev,
  required,
  ...props
}) => {
  if (!Array.isArray(path)) path = [path]
  const value = data.getIn(path) || ''
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
      floatingLabelText={
        <Label label={label} path={path} required={required} />
      }
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
