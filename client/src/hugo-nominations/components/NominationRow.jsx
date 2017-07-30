import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import IconButton from 'material-ui/IconButton'
import ContentClear from 'material-ui/svg-icons/content/clear'
import TextField from 'material-ui/TextField'
import { Col, Row } from 'react-flexbox-grid'

const NominationField = ({ changed, disabled, name, onChange, value }) => <TextField
  className={'NominationField' + (changed ? ' changed' : '')}
  disabled={disabled}
  fullWidth
  multiLine
  name={name}
  onChange={onChange}
  underlineDisabledStyle={{
    borderBottomStyle: 'dashed',
    borderBottomWidth: 1
  }}
  value={value}
/>

NominationField.propTypes = {
  changed: PropTypes.bool,
  disabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string.isRequired
}

class NominationRemoveButton extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool.isRequired,
    onRemove: PropTypes.func
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.disabled !== this.props.disabled
  }

  render () {
    const { disabled, onRemove } = this.props
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
    </IconButton>
  }
}

export const NominationFillerRow = ({ colSpan, fields }) => <Row>
  {
    fields.map(field => <Col key={field} xs={colSpan}>
      <TextField
        className='NominationField NominationLink'
        disabled
        fullWidth
        name={field}
        style={{ cursor: 'default' }}
        underlineDisabledStyle={{
          borderBottomStyle: 'dashed',
          borderBottomWidth: 1
        }}
        value=''
      />
    </Col>)
  }
</Row>

export class NominationRow extends React.Component {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    colSpan: PropTypes.number.isRequired,
    defaultValues: ImmutablePropTypes.map.isRequired,
    disabled: PropTypes.bool,
    fields: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    values: ImmutablePropTypes.map.isRequired
  }

  shouldComponentUpdate (nextProps) {
    const { defaultValues, disabled, values } = this.props
    return nextProps.disabled !== disabled || !defaultValues.equals(nextProps.defaultValues) || !values.equals(nextProps.values)
  }

  render () {
    const { active, colSpan, defaultValues, disabled, fields, onChange, onRemove, values } = this.props
    return <Row bottom='xs'>
      {
        fields.map(field => <Col
          key={field}
          className='NominationFieldCell'
          xs={colSpan}
        >
          <NominationField
            changed={values.get(field, '') != defaultValues.get(field, '')}
            disabled={disabled}
            name={field}
            onChange={active ? ev => onChange(field, ev.target.value) : () => {}}
            value={values.get(field, '')}
          />
        </Col>)
      }
      { !active || values.isEmpty() ? null : <NominationRemoveButton disabled={disabled} onRemove={onRemove} /> }
    </Row>
  }
}
