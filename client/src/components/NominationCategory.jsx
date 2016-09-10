import { Map } from 'immutable'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import ListCheck from 'material-ui/svg-icons/av/playlist-add-check'
import ContentClear from 'material-ui/svg-icons/content/clear'
import ContentUndo from 'material-ui/svg-icons/content/undo'
import TextField from 'material-ui/TextField'

import time_diff from '../lib/time_diff'

import './NominationCategory.css'


const NominationField = ({ changed, disabled, name, onChange, value }) => <TextField
  className={ 'NominationField' + (changed ? ' changed' : '') }
  disabled={disabled}
  name={name}
  onChange={onChange}
  value={value}
/>;

NominationField.propTypes = {
  changed: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  name: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func,
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
            changed={ values.get(field, '') != defaultValues.get(field, '') }
            disabled={disabled}
            name={field}
            onChange={ ev => onChange(field, ev.target.value) }
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
    onReset: React.PropTypes.func.isRequired,
    saveTime: React.PropTypes.instanceOf(Date)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.disabled !== this.props.disabled || nextProps.saveTime !== this.props.saveTime;
  }

  render() {
    const { colSpan, disabled, onSave, onReset, saveTime } = this.props;
    return <tr>
      <td colSpan={colSpan}>
        { saveTime ? <span title={saveTime}>{ 'Last saved ' + time_diff(saveTime) }</span> : null }
        <RaisedButton
          className='NominationActionButton'
          label='Save'
          disabled={disabled}
          icon={<ListCheck />}
          onTouchTap={onSave}
        />
        <RaisedButton
          className='NominationActionButton'
          label='Reset'
          disabled={disabled}
          icon={<ContentUndo />}
          onTouchTap={onReset}
        />
      </td>
    </tr>;
  }
}


const NominationCategory = ({ fields, maxNominations, onChange, onSave, onReset, state }) => {
  const clientData = state.get('clientData');
  const serverData = state.get('serverData');
  const serverTime = state.get('serverTime');
  const isFetching = state.get('isFetching');
  const rows = clientData.size < maxNominations ? clientData.push(Map()) : clientData;
  return <tbody className='NominationCategory'>
    {
      rows.map((rowValues, idx) => <NominationRow
        key={idx}
        defaultValues={ serverData.get(idx, Map()) }
        disabled={isFetching}
        fields={fields}
        onChange={ (field, value) => onChange(idx, rowValues.set(field, value)) }
        onRemove={ () => onChange(idx, null) }
        values={rowValues}
      />)
    }
    <NominationActionsRow
      colSpan={fields.length}
      disabled={ isFetching || clientData.equals(serverData) }
      onSave={onSave}
      onReset={onReset}
      saveTime={ serverTime ? new Date(serverTime) : null }
    />
  </tbody>;
}

NominationCategory.propTypes = {
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

export default NominationCategory;
