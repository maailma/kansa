import React from 'react'
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

import { midGray, orange } from '../../theme'
import { emptyPaperPubsMap, membershipTypes} from '../constants'

export const TextInput = ({ getDefaultValue, getValue, inputRef, label, onChange, path, required, style = {}, ...props }) => {
  if (!Array.isArray(path)) path = [ path ];
  const value = getValue(path);
  if (value === null) return null;
  if (!label) {
    const ps = path.join(' ');
    label = ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ');
  }
  if (required) label += ' (Required)';
  const ulStyle = {}
  if (required && !value) {
    ulStyle.borderBottomWidth = 2;
    ulStyle.borderColor = midGray;
  } else if (value !== getDefaultValue(path)) {
    ulStyle.borderColor = orange;
  }
  return <TextField
    floatingLabelText={label}
    floatingLabelFixed={true}
    floatingLabelStyle={{ color: value ? midGray : 'rgba(0, 0, 0, 0.870588)' }}
    fullWidth={true}
    style={style}
    className='memberInput'
    underlineStyle={ulStyle}
    underlineFocusStyle={ulStyle}
    value={value}
    onChange={ ev => onChange(path, ev.target.value) }
    ref={ inputRef || (() => {}) }
    { ...props }
  />;
}
TextInput.propTypes = {
  getDefaultValue: React.PropTypes.func.isRequired,
  getValue: React.PropTypes.func.isRequired,
  onChange: React.PropTypes.func.isRequired
};

export const MembershipSelect = ({ getDefaultValue, getValue, onChange, prices, style }) => {
  const path = ['membership'];
  const prevMembership = getDefaultValue && getDefaultValue(path);
  const prevIdx = membershipTypes.indexOf(prevMembership);
  const prevAmount = prices && prevMembership && prices.getIn(['memberships', prevMembership, 'amount']) || 0;
  const value = getValue(path) || 'NonMember';
  return <SelectField
    errorText={ value === 'NonMember' && prevMembership !== 'NonMember' ? 'Required' : '' }
    floatingLabelFixed={true}
    floatingLabelText='Membership type'
    fullWidth={true}
    onChange={ (ev, idx, value) => onChange(path, value) }
    style={style}
    value={value}
  >
    { membershipTypes.map((type, idx) => {
      if (type === 'NonMember' && prevMembership !== 'NonMember') return null;
      const amount = prices ? prices.getIn(['memberships', type, 'amount'], -100) : -100;
      const eurAmount = (amount - prevAmount) / 100;
      const label = prices && prices.getIn(['memberships', type, 'description']) || type;
      return <MenuItem
        key={type}
        disabled={ eurAmount < 0 || idx < prevIdx }
        value={type}
        primaryText={ eurAmount <= 0 ? label : `${label} (€${eurAmount})` }
      />
    }) }
  </SelectField>;
}
