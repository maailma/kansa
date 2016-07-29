import React from 'react'
import TextField from 'material-ui/TextField';

const styles = {
  changed: { borderColor: 'rgb(255, 152, 0)' },
  loc: { width: '162px' },
  paperPubs: { width: '162px', verticalAlign: 'top' }
}

function label(path) {
  const ps = path.join(' ');
  return ps.charAt(0).toUpperCase() + ps.slice(1).replace(/_/g, ' ');
}

const TextInput = ({ getDefaultValue, getValue, onChange, path, required, ...props }) => {
  if (!Array.isArray(path)) path = [ path ];
  const value = getValue(path);
  if (value === null) return null;
  const ulStyle = value === getDefaultValue(path) ? {} : styles.changed;
  return <TextField
    floatingLabelText={label(path)}
    floatingLabelFixed={true}
    className='memberInput'
    underlineStyle={ulStyle}
    underlineFocusStyle={ulStyle}
    value={value}
    errorText={ !required || value ? '' : 'Required' }
    onChange={ ev => onChange(path, ev.target.value) }
    { ...props }
  />;
}

const MemberForm = (props) => <form>
  <TextInput { ...props } path='legal_name' required={true} />
  <TextInput { ...props } path='email' required={true} />
  <br />
  <TextInput { ...props } path='public_first_name' />
  <TextInput { ...props } path='public_last_name' />
  <br />
  <TextInput { ...props } path='city' style={styles.loc} />
  <TextInput { ...props } path='state' style={styles.loc} />
  <TextInput { ...props } path='country' style={styles.loc} />
  <br />
  <TextInput { ...props } path={['paper_pubs', 'name']} required={true} style={styles.paperPubs} />
  <TextInput { ...props } path={['paper_pubs', 'address']} required={true} multiLine={true} style={styles.paperPubs} />
  <TextInput { ...props } path={['paper_pubs', 'country']} required={true} style={styles.paperPubs} />
</form>;

export default MemberForm;
