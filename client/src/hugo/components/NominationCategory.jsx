import { Map } from 'immutable'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import ListCheck from 'material-ui/svg-icons/av/playlist-add-check'
import ContentClear from 'material-ui/svg-icons/content/clear'
import ContentUndo from 'material-ui/svg-icons/content/undo'
import TextField from 'material-ui/TextField'

import time_diff from '../../lib/time_diff'
import { editNomination, submitNominations, resetNominations } from '../actions'
import { categoryInfo, maxNominationsPerCategory, nominationFields } from '../constants'


const NominationField = ({ changed, disabled, name, onChange, setRef, value, width }) => <TextField
  className={ 'NominationField' + (changed ? ' changed' : '') }
  disabled={disabled}
  multiLine={true}
  name={name}
  onChange={onChange}
  ref={setRef}
  style={{ width }}
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

  shouldComponentUpdate(nextProps) {
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
    setLastField: React.PropTypes.func,
    values: ImmutablePropTypes.map.isRequired,
    width: React.PropTypes.number.isRequired
  }

  shouldComponentUpdate(nextProps) {
    const { defaultValues, disabled, values } = this.props;
    return nextProps.disabled !== disabled || !defaultValues.equals(nextProps.defaultValues) || !values.equals(nextProps.values);
  }

  render() {
    const { defaultValues, disabled, fields, onChange, onRemove, setLastField, values, width } = this.props;
    return <tr>
      {
        fields.map(field => <td
          key={field}
          className='NominationFieldCell'
        >
          <NominationField
            changed={ values.get(field, '') != defaultValues.get(field, '') }
            disabled={disabled}
            name={field}
            onChange={ ev => onChange(field, ev.target.value) }
            setRef={ ref => { if (ref && values.isEmpty()) setLastField(field, ref); } }
            value={ values.get(field, '') }
            width={width}
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

  shouldComponentUpdate(nextProps) {
    return nextProps.disabled !== this.props.disabled || nextProps.saveTime !== this.props.saveTime;
  }

  render() {
    const { colSpan, disabled, onSave, onReset, saveTime } = this.props;
    return <tr>
      <td className='NominationActions' colSpan={colSpan}>
        { saveTime ? <span title={saveTime}>{ 'Last saved ' + time_diff(saveTime) }</span> : null }
        <RaisedButton
          label='Save'
          disabled={disabled}
          icon={<ListCheck />}
          onTouchTap={onSave}
        />
        <RaisedButton
          label='Reset'
          disabled={disabled}
          icon={<ContentUndo />}
          onTouchTap={onReset}
        />
      </td>
    </tr>;
  }
}

const nominationRowLinks = (n, fields, lastRow, width) => {
  if (n <= 0) return null;
  const res = [];
  for (let i = 0; i < n; ++i) res.push(<tr key={`link-${i}`}>
    {
      fields.map(field => <td key={field}>
        <TextField
          className="NominationField NominationLink"
          name={field}
          onFocus={ () => lastRow[field] && lastRow[field].focus() }
          style={{ width }}
          underlineFocusStyle={{ display: 'none' }}
          value=""
        />
      </td>)
    }
  </tr>);
  return res;
}

const NominationBody = ({ fields, maxNominations, onChange, onSave, onReset, state }) => {
  const clientData = state.get('clientData');
  const serverData = state.get('serverData');
  const serverTime = state.get('serverTime');
  const isFetching = state.get('isFetching');
  const rows = clientData.size < maxNominations ? clientData.push(Map()) : clientData;
  const lastRow = {};
  const width = 720 / fields.length - 10;
  return <tbody className='NominationCategory'>
    {
      rows.map((rowValues, idx) => <NominationRow
        key={idx}
        defaultValues={ serverData.get(idx, Map()) }
        disabled={isFetching}
        fields={fields}
        onChange={ (field, value) => onChange(idx, rowValues.set(field, value)) }
        onRemove={ () => onChange(idx, null) }
        setLastField={ (field, ref) => lastRow[field] = ref }
        values={rowValues}
        width={width}
      />)
    }
    { nominationRowLinks(maxNominations - rows.size, fields, lastRow, width) }
    <NominationActionsRow
      colSpan={fields.length}
      disabled={ isFetching || clientData.equals(serverData) }
      onSave={onSave}
      onReset={onReset}
      saveTime={ serverTime ? new Date(serverTime) : null }
    />
  </tbody>;
}

NominationBody.propTypes = {
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

const NominationCategory = ({ category, ...props }) => {
  const { title, description, nominationFieldLabels } = categoryInfo[category];
  const fields = nominationFields(category);

  return <Paper className='NominationCategory'>
    <h3>{ title }</h3>
    <p>{ description }</p>
    <table>
      <thead>
      <tr>
        { fields.map(field => <th key={field}>{ nominationFieldLabels[field] || field }</th>) }
      </tr>
      </thead>
      <NominationBody {...props} fields={fields} maxNominations={maxNominationsPerCategory} />
    </table>
  </Paper>
}

export default connect(
  (state, { category }) => ({
    state: state.nominations.get(category)
  }), (dispatch, { category }) => bindActionCreators({
    onChange: (idx, values) => editNomination(category, idx, values),
    onSave: () => submitNominations(category),
    onReset: () => resetNominations(category)
  }, dispatch)
)(NominationCategory);
