import PropTypes from 'prop-types'
import React from 'react'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'

import getMemberPrice from '../../lib/get-member-price'
import { midGray, orange } from '../../theme'
import { membershipTypes } from '../constants'
import messages from '../messages'

export const TextInput = ({
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
    ulStyle.borderColor = midGray
  } else if (getDefaultValue && value !== getDefaultValue(path)) {
    ulStyle.borderColor = orange
  }
  return (
    <TextField
      floatingLabelText={label}
      floatingLabelFixed
      floatingLabelStyle={{
        color: value ? midGray : 'rgba(0, 0, 0, 0.870588)'
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

export const MembershipSelect = ({
  data,
  getDefaultValue,
  getValue,
  lc = 'en',
  onChange,
  style
}) => {
  const path = ['membership']
  const prevMembership = getDefaultValue && getDefaultValue(path)
  const prevIdx = membershipTypes.indexOf(prevMembership)
  const value = getValue(path) || 'NonMember'
  return (
    <SelectField
      errorText={
        value === 'NonMember' && prevMembership !== 'NonMember'
          ? messages[lc].required()
          : ''
      }
      floatingLabelFixed
      floatingLabelText={messages[lc].membership_type()}
      fullWidth
      onChange={(ev, idx, value) => onChange(path, value)}
      style={style}
      value={value}
    >
      {membershipTypes.map((type, idx) => {
        if (type === 'NonMember' && prevMembership !== 'NonMember') return null
        if (type === 'Exhibitor' && prevMembership !== 'Exhibitor') return null
        if (type === 'Helper' && prevMembership !== 'Helper') return null
        const amount = getMemberPrice(data, prevMembership, type)
        let label
        if (messages[lc][type]) {
          label = messages[lc][type]()
        } else {
          const typeLabel =
            data && data.getIn(['new_member', 'types', type, 'label'])
          label = typeLabel || type
        }
        return (
          <MenuItem
            key={type}
            disabled={amount < 0 || idx < prevIdx}
            value={type}
            primaryText={amount <= 0 ? label : `${label} (€${amount / 100})`}
          />
        )
      })}
    </SelectField>
  )
}
