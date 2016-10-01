import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import IconButton from 'material-ui/IconButton'
import ContentClear from 'material-ui/svg-icons/content/clear'
import TextField from 'material-ui/TextField'


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


export const NominationFillerRow = ({ fields, lastRow, width }) => <tr>
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
</tr>;


export class NominationRow extends React.Component {
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
