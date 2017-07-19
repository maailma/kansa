import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

import Member from './Member';

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
};

function label(path, required) {
  const ps = path.join(' ')
  let label = ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ')
  if (required) label += ' (Required)'
  return label
}

const TextInput = ({ getDefaultValue, getValue, onChange, path, required, style = {}, ...props }) => {
  if (!Array.isArray(path)) path = [ path ];
  const value = getValue(path);
  if (value === null) return null;
  const ulStyle = value === getDefaultValue(path) ? {} : styles.changed;
  return <TextField
    floatingLabelText={label(path, required)}
    floatingLabelFixed={true}
    style={{ ...styles.common, ...style }}
    className='memberInput'
    underlineStyle={ulStyle}
    underlineFocusStyle={ulStyle}
    value={value}
    onChange={ ev => onChange(path, ev.target.value) }
    { ...props }
  />;
}

export const CommonFields = (props) => (<div>
  <TextInput { ...props } path='legal_name' required={true} />
  <TextInput { ...props } path='email' required={true} />
  <br />
  <TextInput { ...props } path='public_first_name' />
  <TextInput { ...props } path='public_last_name' />
  <br />
  <TextInput { ...props } path='city' style={styles.narrow} />
  <TextInput { ...props } path='state' style={styles.narrow} />
  <TextInput { ...props } path='country' style={styles.narrow} />
</div>);
CommonFields.propTypes = basePropTypes;

export const PaperPubsFields = ({ ...props }) => {
  if (!props.getValue(['paper_pubs'])) return null;
  props.required = true;
  props.style = styles.paperPubs;
  return <div>
    <TextInput { ...props } path={['paper_pubs', 'name']} />
    <TextInput { ...props } path={['paper_pubs', 'address']} multiLine={true} />
    <TextInput { ...props } path={['paper_pubs', 'country']} />
  </div>;
}
PaperPubsFields.propTypes = basePropTypes;

export const CommentField = (props) => (<TextInput
  path='comment'
  required={true}
  style={styles.wide}
  multiLine={true}
  textareaStyle={{ marginBottom: '-24px' }}
  { ...props }
  getDefaultValue={ () => '' }
/>);
CommentField.propTypes = {
  getValue: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

const MembershipSelect = ({ getDefaultValue, getValue, onChange }) => {
  const path = ['membership'];
  const prevIdx = Member.membershipTypes.indexOf(getDefaultValue(path));
  return <SelectField
    style={{ marginLeft: '24px' }}
    floatingLabelText='Membership type'
    floatingLabelFixed={true}
    value={ getValue(path) || 'NonMember' }
    onChange={ (ev, idx, value) => onChange(path, value) }
  >
    { Member.membershipTypes.map((type, idx) => (
      <MenuItem
        key={type} value={type} primaryText={type}
        disabled={ idx < prevIdx }
      />
    )) }
  </SelectField>;
}

const PaperPubsCheckbox = ({ getDefaultValue, getValue, onChange }) => {
  const path = ['paper_pubs'];
  return <Checkbox
    style={{ display: 'inline-block', width: '256px', marginLeft: '24px', marginTop: '37px', verticalAlign: 'top' }}
    label='Add paper publications'
    checked={!!getValue(path)}
    disabled={!!getDefaultValue(path)}
    onCheck={ (ev, checked) => onChange(path, checked ? Member.emptyPaperPubsMap : null) }
  />;
}

export const UpgradeFields = (props) => (<div>
  <MembershipSelect { ...props } />
  <PaperPubsCheckbox { ...props } />
  <br />
  <PaperPubsFields { ...props } />
</div>);
UpgradeFields.propTypes = basePropTypes;
