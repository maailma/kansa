import React from 'react'
import { Col, Row } from 'react-flexbox-grid'

import { TextInput } from '../../membership/components/form-components'
import MemberLookupSelector from '../../membership/components/MemberLookupSelector'

const DataField = ({ field, name, onChange, value }) => {
  switch (field.get('type')) {
    case 'number':
      return <TextInput
        getDefaultValue={() => value}
        getValue={() => value}
        label={field.get('label')}
        name={name}
        onChange={onChange}
        path={[]}
        required={field.get('required')}
        type='number'
      />

    case 'string':
      return <TextInput
        getDefaultValue={() => value}
        getValue={() => value}
        label={field.get('label')}
        multiLine
        name={name}
        onChange={onChange}
        path={[]}
        required={field.get('required')}
      />

    case 'boolean':
      console.warn('checkbox data field not implemented!')
      // fallthrough

    default:
      // select(values)
      return <div>{field.get('label') || name}: {value || '[empty]'}</div>
  }
}

const NewPaymentForm = ({ disabled, onChange, people, purchase, requireMembership, shape }) => {
  if (!people || people.size === 0) return null
  const showComments = !disabled || !disabled.includes('comments')
  const showInvoice = !disabled || !disabled.includes('invoice')
  return (
    <form>
      <Row>
        <Col xs={12} sm={3} style={{ padding: 8 }}>
          Payment by or on behalf of:
        </Col>
        <Col xs={12} sm={9}>
          <MemberLookupSelector
            onChange={onChange}
            people={people}
            requireMembership={requireMembership}
            selectedPersonId={purchase.get('person_id')}
          />
        </Col>
      </Row>
      {shape && shape.entrySeq().map(([name, field]) => (
        <DataField
          key={name}
          field={field}
          name={name}
          onChange={(_, value) => onChange({ data: purchase.get('data').set(name, value) })}
          value={purchase.getIn(['data', name]) || ''}
        />
      ))}
      {showInvoice && [
        <TextInput
          getDefaultValue={() => purchase.get('invoice')}
          getValue={() => purchase.get('invoice')}
          key='ii'
          label='Invoice number'
          name='invoice'
          onChange={(_, invoice) => onChange({ invoice })}
          path={[]}
        />,
        <div key='ih' style={{
          color: 'rgba(0, 0, 0, 0.3)',
          fontSize: 12,
          marginTop: -4,
          textAlign: 'right'
        }}>
          If you've received an invoice from Worldcon 75, please include its
          invoice number here.
        </div>
      ]}
      {showComments && <TextInput
        getDefaultValue={() => purchase.get('comments')}
        getValue={() => purchase.get('comments')}
        label='Comments'
        multiLine
        name='comments'
        onChange={(_, comments) => onChange({ comments })}
        path={[]}
        rows={2}
      />}
    </form>
  )
}

export default NewPaymentForm
