import { Map } from 'immutable'
import React from 'react'
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

import MemberDetails from './MemberDetails';

const MembershipSelect = ({ getDefaultValue, getValue, onChange }) => {
  const path = 'membership';
  const prevIdx = MemberDetails.membershipTypes.indexOf(getDefaultValue(path));
  return <SelectField
    floatingLabelText='Membership type'
    floatingLabelFixed={true}
    value={getValue(path)}
    onChange={ (ev, idx, value) => onChange(path, value) }
  >
    { MemberDetails.membershipTypes.map((type, idx) => (
      <MenuItem
        key={type} value={type} primaryText={type}
        disabled={ idx < prevIdx }
      />
    )) }
  </SelectField>;
}

const PaperPubsCheckbox = ({ getDefaultValue, getValue, onChange }) => {
  const path = 'paper_pubs';
  return <Checkbox
    label='Add paper publications'
    style={{ width: '256px', float: 'right', marginTop: '37px' }}
    checked={!!getValue(path)}
    disabled={!!getDefaultValue(path)}
    onCheck={ (ev, checked) => onChange(path, checked ? MemberDetails.emptyPaperPubsMap : null) }
  />;
}

const PaperPubsTextField = ({ ppKey, getValue, onChange, multiLine = false }) => {
  const path = ['paper_pubs', ppKey];
  const value = getValue(path);
  if (value === null) return null;
  return <td><TextField
    floatingLabelText={ 'Paper pubs ' + ppKey }
    floatingLabelFixed={true}
    fullWidth={true}
    multiLine={multiLine}
    value={value}
    errorText={ value ? '' : 'Required' }
    onChange={ ev => onChange(path, ev.target.value) }
  /></td>;
}

const PaperPubsTable = ({ getValue, onChange }) => {
  if (!getValue(['paper_pubs'])) return null;
  return <table style={{ width: '100%' }}>
    <tbody><tr style={{ verticalAlign: 'top' }}>
      <PaperPubsTextField ppKey='name' getValue={getValue} onChange={onChange} />
      <PaperPubsTextField ppKey='address' getValue={getValue} onChange={onChange} multiLine={true} />
      <PaperPubsTextField ppKey='country' getValue={getValue} onChange={onChange} />
    </tr></tbody>
  </table>;
}

const CommentField = ({ getValue, onChange }) => {
  const path = 'comment';
  const value = getValue(path);
  return <TextField
    floatingLabelText='Comment'
    floatingLabelFixed={true}
    multiLine={true}
    fullWidth={true}
    textareaStyle={{ marginBottom: '-24px' }}
    value={value}
    errorText={ value ? '' : 'Required' }
    onChange={ ev => onChange(path, ev.target.value) }
  />;
}

const UpgradeForm = ({ style = {}, ...props }) => (<form style={style}>
  <MembershipSelect { ...props } />
  <PaperPubsCheckbox { ...props } />
  <br />
  <PaperPubsTable { ...props } />
  <CommentField { ...props } />
</form>);

UpgradeForm.propTypes = {
  getDefaultValue: React.PropTypes.func.isRequired,
  getValue: React.PropTypes.func.isRequired,
  onChange: React.PropTypes.func.isRequired,
  style: React.PropTypes.object
};

export default UpgradeForm;
