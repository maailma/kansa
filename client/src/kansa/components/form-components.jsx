import { Map } from 'immutable'
import React from 'react'
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
const { Col, Row } = require('react-flexbox-grid');

import Member from './Member';

const styles = {
  changed: { borderColor: 'rgb(255, 152, 0)' },
  paperPubs: { verticalAlign: 'top' }
}

const basePropTypes = {
  getDefaultValue: React.PropTypes.func.isRequired,
  getValue: React.PropTypes.func.isRequired,
  onChange: React.PropTypes.func.isRequired
};

function label(path) {
  const ps = path.join(' ');
  return ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ');
}

const TextInput = ({ getDefaultValue, getValue, onChange, path, required, style = {}, ...props }) => {
  if (!Array.isArray(path)) path = [ path ];
  const value = getValue(path);
  if (value === null) return null;
  const ulStyle = value === getDefaultValue(path) ? {} : styles.changed;
  return <TextField
    floatingLabelText={label(path)}
    floatingLabelFixed={true}
    fullWidth={true}
    style={style}
    className='memberInput'
    underlineStyle={ulStyle}
    underlineFocusStyle={ulStyle}
    value={value}
    errorText={ !required || value ? '' : 'Required' }
    onChange={ ev => onChange(path, ev.target.value) }
    { ...props }
  />;
}

export const CommonFields = (props) => (<div>
  <Row>
    <Col xs={12} sm={6}>
      <TextInput { ...props } path='legal_name' required={true} />
    </Col>
    <Col xs={12} sm={6}>
      <TextInput { ...props } path='email' required={true} />
    </Col>
  </Row>
  <Row>
    <Col xs={12} sm={6}>
      <TextInput { ...props } path='public_first_name' />
    </Col>
    <Col xs={12} sm={6}>
      <TextInput { ...props } path='public_last_name' />
    </Col>
  </Row>
  <Row>
    <Col xs={12} sm={4}>
      <TextInput { ...props } path='city' />
    </Col>
    <Col xs={12} sm={4}>
      <TextInput { ...props } path='state' />
    </Col>
    <Col xs={12} sm={4}>
      <TextInput { ...props } path='country' />
    </Col>
  </Row>
</div>);
CommonFields.propTypes = basePropTypes;

export const PaperPubsFields = ({ ...props }) => {
  if (!props.getValue(['paper_pubs'])) return null;
  props.required = true;
  props.style = styles.paperPubs;
  return <Row>
    <Col xs={12} sm={4}>
      <TextInput { ...props } path={['paper_pubs', 'name']} />
    </Col>
    <Col xs={12} sm={4}>
      <TextInput { ...props } path={['paper_pubs', 'address']} multiLine={true} />
    </Col>
    <Col xs={12} sm={4}>
      <TextInput { ...props } path={['paper_pubs', 'country']} />
    </Col>
  </Row>;
}
PaperPubsFields.propTypes = basePropTypes;

export const CommentField = (props) => (<TextInput
  path='comment'
  required={true}
  multiLine={true}
  textareaStyle={{ marginBottom: '-24px' }}
  { ...props }
  getDefaultValue={ () => '' }
/>);
CommentField.propTypes = {
  getValue: React.PropTypes.func.isRequired,
  onChange: React.PropTypes.func.isRequired
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
