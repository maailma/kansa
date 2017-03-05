import React from 'react'
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import ContentMail from 'material-ui/svg-icons/content/mail'
const { Col, Row } = require('react-flexbox-grid');

import { emptyPaperPubsMap, membershipTypes} from '../constants'

const styles = {
  changed: { borderColor: 'rgb(255, 152, 0)' },
  paperPubs: { marginBottom: 12, verticalAlign: 'top' }
}

export const TextInput = ({ getDefaultValue, getValue, inputRef, label, onChange, path, required, style = {}, ...props }) => {
  if (!Array.isArray(path)) path = [ path ];
  const value = getValue(path);
  if (value === null) return null;
  if (!label) {
    const ps = path.join(' ');
    label = ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ');
  }
  const ulStyle = value === getDefaultValue(path) ? {} : styles.changed;
  return <TextField
    floatingLabelText={label}
    floatingLabelFixed={true}
    fullWidth={true}
    style={style}
    className='memberInput'
    underlineStyle={ulStyle}
    underlineFocusStyle={ulStyle}
    value={value}
    errorText={ !required || value ? '' : 'Required' }
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
  return <SelectField
    floatingLabelFixed={true}
    floatingLabelText='Membership type'
    onChange={ (ev, idx, value) => onChange(path, value) }
    style={style}
    value={ getValue(path) || 'NonMember' }
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

export const PaperPubsCheckbox = ({ getDefaultValue, getValue, onChange, prices, style }) => {
  const path = ['paper_pubs'];
  const eurAmount = prices ? prices.getIn(['PaperPubs', 'amount'], 0) / 100 : -1;
  return <Checkbox
    checkedIcon={<ContentMail />}
    style={style}
    label={`Add paper publications (€${eurAmount})`}
    checked={!!getValue(path)}
    disabled={!!getDefaultValue(path)}
    onCheck={ (ev, checked) => onChange(path, checked ? emptyPaperPubsMap : null) }
  />;
}

export const PaperPubsFields = ({ getDefaultValue, getValue, onChange }) => {
  if (!getValue(['paper_pubs'])) return null;
  const props = {
    getDefaultValue,
    getValue,
    onChange,
    required: true,
    style: styles.paperPubs
  }
  return <Row>
    <Col xs={12} sm={4}>
      <TextInput { ...props } label="Mail name" path={['paper_pubs', 'name']} />
    </Col>
    <Col xs={12} sm={4}>
      <TextInput
        { ...props }
        label="Mail address (multiline)"
        multiLine={true}
        path={['paper_pubs', 'address']}
      />
    </Col>
    <Col xs={12} sm={4}>
      <TextInput { ...props } label="Mail country" path={['paper_pubs', 'country']} />
    </Col>
  </Row>;
}
PaperPubsFields.propTypes = TextInput.propTypes;
