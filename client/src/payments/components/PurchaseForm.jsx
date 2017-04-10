import { List as ImmutableList } from 'immutable'
import React from 'react'
const { Col, Row } = require('react-flexbox-grid');

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'

import MemberLookupSelector from '../../membership/components/MemberLookupSelector'

const PurchaseTextField = ({ label, onChange, required, value, ...props }) => {
  return <TextField
    floatingLabelText={label}
    floatingLabelFixed={true}
    fullWidth={true}
    value={value}
    errorStyle={{ color: 'rgba(0, 0, 0, 0.5)' }}
    errorText={ !required || value ? '' : 'Required' }
    onChange={onChange}
    { ...props }
  />;
}

const DataField = ({ field, name, onChange, value }) => {
  switch (field.get('type')) {

    case 'number':
      return <PurchaseTextField
        label={field.get('label')}
        name={name}
        onChange={onChange}
        required={field.get('required')}
        value={value}
        type="number"
      />;

    case 'string':
      return <PurchaseTextField
        label={field.get('label')}
        name={name}
        onChange={onChange}
        required={field.get('required')}
        value={value}
      />;

    case 'boolean':
      // checkbox

    default:
      // select(values)
      return <div>{field.get('label') || name}: {value || '[empty]'}</div>;

  }
}

export default class PurchaseForm extends React.Component {

  render() {
    const { disabled, onChange, people, purchase, shape } = this.props;
    const showComments = !disabled || !disabled.includes('comments');
    const showInvoice = !disabled || !disabled.includes('invoice');
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
              selectedPersonId={purchase.get('person_id')}
            />
          </Col>
        </Row>
        {shape && shape.entrySeq().map(([name, field]) => (
          <DataField
            key={name}
            field={field}
            name={name}
            onChange={(ev, value) => onChange({ data: purchase.get('data').set(name, value) })}
            value={purchase.getIn(['data', name]) || ''}
          />
        ))}
        {showInvoice && [
          <PurchaseTextField
            key="ii"
            label="Invoice number"
            name="invoice"
            onChange={ev => onChange({ invoice: ev.target.value })}
            value={purchase.get('invoice')}
          />,
        <div key="ih" style={{
            color: 'rgba(0, 0, 0, 0.3)',
            fontSize: 12,
            marginTop: -4,
            textAlign: 'right'
          }}>
            If you've received an invoice from Worldcon 75, please include its
            invoice number here.
          </div>
        ]}
        {showComments && <PurchaseTextField
          label="Comments"
          multiLine={true}
          name="comments"
          onChange={ev => onChange({ comments: ev.target.value })}
          rows={2}
          value={purchase.get('comments')}
        />}
      </form>
    );
  }
}
