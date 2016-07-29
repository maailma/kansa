import { Map } from 'immutable'
import React from 'react'
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

import Member from './Member';

const MembershipSelect = ({ getDefaultValue, getValue, onChange }) => {
  const path = ['membership'];
  const prevIdx = Member.membershipTypes.indexOf(getDefaultValue(path));
  return <SelectField
    style={{ marginLeft: '24px' }}
    floatingLabelText='Membership type'
    floatingLabelFixed={true}
    value={getValue(path)}
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

const PaperPubsTextField = ({ ppKey, getValue, onChange, multiLine = false }) => {
  const path = ['paper_pubs', ppKey];
  const value = getValue(path);
  if (value === null) return null;
  return <TextField
    style={{ width: '162px', marginLeft: '24px', verticalAlign: 'top' }}
    floatingLabelText={ 'Paper pubs ' + ppKey }
    floatingLabelFixed={true}
    multiLine={multiLine}
    value={value}
    errorText={ value ? '' : 'Required' }
    onChange={ ev => onChange(path, ev.target.value) }
  />;
}

const PaperPubsFields = ({ getValue, onChange }) => {
  if (!getValue(['paper_pubs'])) return null;
  return <div>
    <PaperPubsTextField ppKey='name' getValue={getValue} onChange={onChange} />
    <PaperPubsTextField ppKey='address' getValue={getValue} onChange={onChange} multiLine={true} />
    <PaperPubsTextField ppKey='country' getValue={getValue} onChange={onChange} />
  </div>;
}

const CommentField = ({ getValue, onChange }) => {
  const path = ['comment'];
  const value = getValue(path);
  return <TextField
    style={{ width: '536px', marginLeft: '24px' }}
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
  <PaperPubsFields { ...props } />
  <CommentField { ...props } />
</form>);

UpgradeForm.propTypes = {
  getDefaultValue: React.PropTypes.func.isRequired,
  getValue: React.PropTypes.func.isRequired,
  onChange: React.PropTypes.func.isRequired,
  style: React.PropTypes.object
};

export default UpgradeForm;
