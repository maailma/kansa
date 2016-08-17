import { Map } from 'immutable'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import ListCheck from 'material-ui/svg-icons/av/playlist-add-check'
//import ContentAdd from 'material-ui/svg-icons/content/add'
import ContentClear from 'material-ui/svg-icons/content/clear'
import ContentUndo from 'material-ui/svg-icons/content/undo'
import TextField from 'material-ui/TextField'



const styles = {
  button: { float: 'right', marginLeft: 12 },
  fieldChangedUlStyle: { borderColor: 'rgb(255, 152, 0)' }
}


const NominationField = ({ disabled, name, onChange, ulStyle, value }) => <TextField
  className='nominationField'
  disabled={disabled}
  name={name}
  onChange={onChange}
  underlineStyle={ulStyle}
  underlineFocusStyle={ulStyle}
  value={value}
/>;

NominationField.propTypes = {
  disabled: React.PropTypes.bool.isRequired,
  name: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func,
  ulStyle: React.PropTypes.object.isRequired,
  value: React.PropTypes.string.isRequired
}


class NominationRemoveButton extends React.Component {
  static propTypes = {
    disabled: React.PropTypes.bool.isRequired,
    onRemove: React.PropTypes.func
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.disabled !== this.props.disabled;
  }

  render() {
    const { disabled, onRemove } = this.props;
    return <IconButton
      disabled={disabled}
      iconStyle={{ }}
      onTouchTap={onRemove}
      tooltip='Remove nomination'
      tooltipStyles={{ top: 24 }}
    >
      <ContentClear />
    </IconButton>;
  }
}


class NominationRow extends React.Component {
  static propTypes = {
    defaultValues: ImmutablePropTypes.map.isRequired,
    disabled: React.PropTypes.bool,
    fields: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    values: ImmutablePropTypes.map.isRequired
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { defaultValues, disabled, values } = this.props;
    return nextProps.disabled !== disabled || !defaultValues.equals(nextProps.defaultValues) || !values.equals(nextProps.values);
  }

  render() {
    const { defaultValues, disabled, fields, onChange, onRemove, values } = this.props;
    return <tr>
      {
        fields.map(field => <td key={field}>
          <NominationField
            disabled={disabled}
            name={field}
            onChange={ ev => onChange(field, ev.target.value) }
            ulStyle={ values.get(field, '') == defaultValues.get(field, '') ? {} : styles.fieldChangedUlStyle }
            value={ values.get(field, '') }
          />
        </td>)
      }
      <td>
        { values.isEmpty() ? null : <NominationRemoveButton disabled={disabled} onRemove={onRemove} /> }
      </td>
    </tr>;
  }
}


class NominationActionsRow extends React.Component {
  static propTypes = {
    colSpan: React.PropTypes.number.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.disabled !== this.props.disabled;
  }

  render() {
    const { colSpan, disabled, onSave, onReset } = this.props;
    return <tr>
      <td colSpan={colSpan}>
        <RaisedButton
          label='Save'
          style={styles.button}
          disabled={disabled}
          disabledBackgroundColor='transparent'
          icon={<ListCheck />}
          onTouchTap={onSave}
        />
        <RaisedButton
          label='Reset'
          style={styles.button}
          disabled={disabled}
          disabledBackgroundColor='transparent'
          icon={<ContentUndo />}
          onTouchTap={onReset}
        />
      </td>
    </tr>;
  }
}


const NominationForm = ({ fields, maxNominations, onChange, onSave, onReset, state }) => {
  const defaultValues = state.get('serverData');
  const disabled = state.get('isFetching');
  const values = state.get('clientData');
  const rows = values.size < maxNominations ? values.push(Map()) : values;
  return <tbody>
    {
      rows.map((rowValues, idx) => <NominationRow
        key={idx}
        defaultValues={ defaultValues.get(idx, Map()) }
        disabled={disabled}
        fields={fields}
        onChange={ (field, value) => onChange(idx, rowValues.set(field, value)) }
        onRemove={ () => onChange(idx, null) }
        values={rowValues}
      />)
    }
    <NominationActionsRow
      colSpan={fields.length}
      disabled={ disabled || values.equals(defaultValues) }
      onSave={onSave}
      onReset={onReset}
    />
  </tbody>;
}

NominationForm.propTypes = {
  fields: React.PropTypes.array.isRequired,
  maxNominations: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func.isRequired,
  onReset: React.PropTypes.func.isRequired,
  state: ImmutablePropTypes.mapContains({
    clientData: ImmutablePropTypes.list.isRequired,
    serverData: ImmutablePropTypes.list.isRequired,
    //serverTime: React.PropTypes.string,
    //isFetching: React.PropTypes.bool.isRequired,
    //error: React.PropTypes.string
  }).isRequired
};

export default NominationForm;
