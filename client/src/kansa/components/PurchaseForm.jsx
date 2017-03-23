import { List as ImmutableList } from 'immutable'
import React from 'react'
const { Col, Row } = require('react-flexbox-grid');

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'
import Paper from 'material-ui/Paper'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

const PurchaseTextField = ({ label, onChange, required, value, ...props }) => {
  return <TextField
    floatingLabelText={label}
    floatingLabelFixed={true}
    fullWidth={true}
    value={value}
    errorText={ !required || value ? '' : 'Required' }
    onChange={onChange}
    { ...props }
  />;
}

const DataField = ({ field, name, onChange, value }) => {
  switch (field.get('type')) {

    case 'string':
      return <PurchaseTextField
        label={field.get('label')}
        onChange={onChange}
        required={field.get('required')}
        value={value}
      />;

    case 'boolean':
      // checkbox

    default:
      // select(values)

  }
}

const PurchaseForm = ({ onChange, people, purchase, shape }) => {
  const currentPersonId = purchase.get('person');
  return (
    <form>
      <Row>
        <Col xs={12} sm={3} style={{ paddingBottom: 24 }}>
          Payment by or on behalf of:
        </Col>
        <Col xs={12} sm={9}>
          <RadioButtonGroup
            name="person"
            onChange={(ev, person) => {
              if (person) {
                const email = person.get('email');
                const id = person.get('id');
                const name = person.get('legal_name');
                onChange({ email, name, person: id });
              } else {
                onChange({ person: null });
              }
            }}
            style={{ paddingLeft: 24 }}
          >
            {people.entrySeq().map(([i, person]) => (
              <RadioButton
                key={i}
                label={person.get('legal_name')}
                style={{ marginBottom: 8 }}
                value={person}
              />
            ))}
          </RadioButtonGroup>
        </Col>
      </Row>
      {shape.entrySeq().map(([name, field]) => (
        <DataField
          key={name}
          field={field}
          name={name}
          onChange={(ev, value) => onChange({ data: purchase.get('data').set(name, value) })}
          value={purchase.getIn(['data', name]) || ''}
        />
      ))}
      <PurchaseTextField
        label="Invoice number"
        name="invoice"
        onChange={ev => onChange({ invoice: ev.target.value })}
        value={purchase.get('invoice')}
      />
      <div style={{
        color: 'rgba(0, 0, 0, 0.3)',
        fontSize: 12,
        marginTop: -4,
        textAlign: 'right'
      }}>
        If you've received an invoice from Worldcon 75, please include its
        invoice number here.
      </div>
      <PurchaseTextField
        label="Comments"
        multiLine={true}
        name="comments"
        onChange={ev => onChange({ comments: ev.target.value })}
        rows={2}
        value={purchase.get('comments')}
      />
    </form>
  );
}

export default PurchaseForm;
