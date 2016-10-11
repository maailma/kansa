import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import IconButton from 'material-ui/IconButton'
import ContentClear from 'material-ui/svg-icons/content/clear'
import TextField from 'material-ui/TextField'
const { Col, Row } = require('react-flexbox-grid');


const NominationField = ({ changed, disabled, name, onChange, setRef, value }) => <TextField
  className={ 'NominationField' + (changed ? ' changed' : '') }
  disabled={disabled}
  fullWidth={true}
  multiLine={true}
  name={name}
  onChange={onChange}
  ref={setRef}
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
      style={{
        position: 'absolute',
        left: '100%'
      }}
      tooltip='Remove nomination'
      tooltipStyles={{ top: 24 }}
    >
      <ContentClear />
    </IconButton>;
  }
}


export const NominationFillerRow = ({ colSpan, fields, lastRow }) => <Row>
  {
    fields.map(field => <Col key={field} xs={colSpan}>
      <TextField
        className="NominationField NominationLink"
        fullWidth={true}
        name={field}
        onFocus={ () => lastRow[field] && lastRow[field].focus() }
        underlineFocusStyle={{ display: 'none' }}
        value=""
      />
    </Col>)
  }
</Row>;


export class NominationRow extends React.Component {
  static propTypes = {
    colSpan: React.PropTypes.number.isRequired,
    defaultValues: ImmutablePropTypes.map.isRequired,
    disabled: React.PropTypes.bool,
    fields: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    setLastField: React.PropTypes.func,
    values: ImmutablePropTypes.map.isRequired
  }

  shouldComponentUpdate(nextProps) {
    const { defaultValues, disabled, values } = this.props;
    return nextProps.disabled !== disabled || !defaultValues.equals(nextProps.defaultValues) || !values.equals(nextProps.values);
  }

  render() {
    const { colSpan, defaultValues, disabled, fields, onChange, onRemove, setLastField, values } = this.props;
    return <Row bottom='xs'>
      {
        fields.map(field => <Col
          key={field}
          className='NominationFieldCell'
          xs={colSpan}
        >
          <NominationField
            changed={ values.get(field, '') != defaultValues.get(field, '') }
            disabled={disabled}
            name={field}
            onChange={ ev => onChange(field, ev.target.value) }
            setRef={ ref => { if (ref && values.isEmpty()) setLastField(field, ref); } }
            value={ values.get(field, '') }
          />
        </Col>)
      }
      { values.isEmpty() ? null : <NominationRemoveButton disabled={disabled} onRemove={onRemove} /> }
    </Row>;
  }
}
