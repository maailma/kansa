import Checkbox from 'material-ui/Checkbox'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React from 'react'

import { newPaperPubs } from '../../membership/components/paper-pubs'
import { membershipTypes } from './Member'

const styles = {
  common: { marginLeft: '24px' },
  changed: { borderColor: 'rgb(255, 152, 0)' },
  narrow: { width: '162px' },
  wide: { width: '536px' },
  paperPubs: { width: '162px', verticalAlign: 'top' }
}

const basePropTypes = {
  getDefaultValue: PropTypes.func.isRequired,
  getValue: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
}

function label(path, required) {
  const ps = path.join(' ')
  let label = ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ')
  if (required) label += ' (Required)'
  return label
}

const TextInput = ({
  getDefaultValue,
  getValue,
  onChange,
  path,
  required,
  style = {},
  ...props
}) => {
  if (!Array.isArray(path)) path = [path]
  const value = getValue(path)
  if (value === null) return null
  const ulStyle = value === getDefaultValue(path) ? {} : styles.changed
  return (
    <TextField
      floatingLabelText={label(path, required)}
      floatingLabelFixed
      style={{ ...styles.common, ...style }}
      className="memberInput"
      underlineStyle={ulStyle}
      underlineFocusStyle={ulStyle}
      value={value}
      onChange={ev => onChange(path, ev.target.value)}
      {...props}
    />
  )
}

export const CommonFields = props => (
  <div>
    <TextInput {...props} path="legal_name" required />
    <TextInput {...props} path="email" required />
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <TextInput {...props} path="badge_name" multiLine rowsMax={2} />
      <TextInput {...props} path="badge_subtitle" />
    </div>
    <TextInput {...props} path="public_first_name" />
    <TextInput {...props} path="public_last_name" />
    <br />
    <TextInput {...props} path="city" style={styles.narrow} />
    <TextInput {...props} path="state" style={styles.narrow} />
    <TextInput {...props} path="country" style={styles.narrow} />
  </div>
)
CommonFields.propTypes = basePropTypes

export const PaperPubsFields = ({ ...props }) => {
  if (!props.getValue(['paper_pubs'])) return null
  props.required = true
  props.style = styles.paperPubs
  return (
    <div>
      <TextInput {...props} path={['paper_pubs', 'name']} />
      <TextInput {...props} path={['paper_pubs', 'address']} multiLine />
      <TextInput {...props} path={['paper_pubs', 'country']} />
    </div>
  )
}
PaperPubsFields.propTypes = basePropTypes

export const CommentField = props => (
  <TextInput
    path="comment"
    required
    style={styles.wide}
    multiLine
    textareaStyle={{ marginBottom: '-24px' }}
    {...props}
    getDefaultValue={() => ''}
  />
)
CommentField.propTypes = {
  getValue: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
}

const MembershipSelect = ({ getDefaultValue, getValue, onChange }) => {
  const path = ['membership']
  const prevIdx = membershipTypes.indexOf(getDefaultValue(path))
  return (
    <SelectField
      style={{ marginLeft: '24px' }}
      floatingLabelText="Membership type"
      floatingLabelFixed
      value={getValue(path) || 'NonMember'}
      onChange={(ev, idx, value) => onChange(path, value)}
    >
      {membershipTypes.map((type, idx) => (
        <MenuItem
          key={type}
          value={type}
          primaryText={type}
          disabled={idx < prevIdx}
        />
      ))}
    </SelectField>
  )
}

const PaperPubsCheckbox = ({ getDefaultValue, getValue, onChange }) => {
  const path = ['paper_pubs']
  return (
    <Checkbox
      style={{
        display: 'inline-block',
        width: '256px',
        marginLeft: '24px',
        marginTop: '37px',
        verticalAlign: 'top'
      }}
      label="Add paper publications"
      checked={!!getValue(path)}
      disabled={!!getDefaultValue(path)}
      onCheck={(ev, checked) =>
        onChange(path, checked ? newPaperPubs(getValue) : null)
      }
    />
  )
}

export const UpgradeFields = props => (
  <div>
    <MembershipSelect {...props} />
    <PaperPubsCheckbox {...props} />
    <br />
    <PaperPubsFields {...props} />
  </div>
)
UpgradeFields.propTypes = basePropTypes
