import React from 'react'
import { Col, Row } from 'react-flexbox-grid'

import TextInput from '../../lib/text-input'
import MemberLookupSelector from '../../membership/components/MemberLookupSelector'

const DataField = ({ field, onChange, value }) => {
  switch (field.get('type')) {
    case 'number':
      return (
        <TextInput
          getDefaultValue={() => value}
          getValue={() => value}
          label={field.get('label')}
          name={field.get('key')}
          onChange={onChange}
          path={[]}
          required={field.get('required')}
          type="number"
        />
      )

    case 'string':
      return (
        <TextInput
          getDefaultValue={() => value}
          getValue={() => value}
          label={field.get('label')}
          multiLine
          name={field.get('key')}
          onChange={onChange}
          path={[]}
          required={field.get('required')}
        />
      )

    case 'boolean':
      console.warn('checkbox data field not implemented!')
    // fallthrough

    default:
      // select(values)
      return (
        <div>
          {field.get('label') || field.get('key')}: {value || '[empty]'}
        </div>
      )
  }
}

const NewPaymentForm = ({
  onChange,
  people,
  purchase,
  requireMembership,
  shape
}) => {
  if (!people || people.size === 0) return null
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
      {shape &&
        shape.map(field => {
          const name = field.get('key')
          const df = (
            <DataField
              key={name}
              field={field}
              onChange={(_, value) =>
                onChange({ data: purchase.get('data').set(name, value) })
              }
              value={purchase.getIn(['data', name]) || ''}
            />
          )
          return name === 'invoice'
            ? [
                df,
                <div
                  key="invoice-help"
                  style={{
                    color: 'rgba(0, 0, 0, 0.3)',
                    fontSize: 12,
                    marginTop: -4,
                    textAlign: 'right'
                  }}
                >
                  If you've received an invoice from Worldcon 75, please include
                  its invoice number here.
                </div>
              ]
            : df
        })}
    </form>
  )
}

export default NewPaymentForm
