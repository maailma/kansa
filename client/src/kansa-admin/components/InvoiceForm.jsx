import { List } from 'immutable'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'
import React from 'react'

const styles = {
  common: {}
}

const TypeSelect = ({ category, onChange, paymentData, type }) => {
  const cache = {}
  return (
    <SelectField
      floatingLabelFixed
      floatingLabelText="Payment type"
      onChange={(ev, idx, type) => {
        let update = cache[type]
        if (update.category !== category)
          update = Object.assign({ data: {} }, update)
        onChange(update)
      }}
      style={styles.common}
      value={type}
    >
      {paymentData.reduce((list, data, category) => {
        list.push(
          <MenuItem
            disabled
            key={'cat:' + category}
            primaryText={`== ${data.get('label') || category}`}
            value=""
          />
        )
        data.get('types').forEach(type => {
          const key = type.get('key')
          list.push(
            <MenuItem key={key} primaryText={type.get('label')} value={key} />
          )
          cache[key] = { amount: type.get('amount'), category, type: key }
        })
        return list
      }, [])}
    </SelectField>
  )
}

const DataField = ({ field, onChange, style = {}, value }) => {
  const isNumber = field.get('type') === 'number'
  let label = field.get('label')
  if (field.get('required')) label += ' (Required)'
  return (
    <TextField
      floatingLabelFixed
      floatingLabelText={label}
      fullWidth
      multiLine={!isNumber}
      name={field.get('key')}
      onChange={onChange}
      style={{ ...styles.common, ...style }}
      type={isNumber ? 'number' : null}
      value={value}
    />
  )
}

const InvoiceForm = ({
  invoice: { amount, category, comments, data, invoice, type },
  onChange,
  paymentData
}) => (
  <form>
    <div style={{ float: 'right' }}>
      <span style={{ paddingRight: 8 }}>€</span>
      <TextField
        floatingLabelFixed
        floatingLabelText="Amount"
        name="amount"
        onChange={(_, value) => {
          const amount = value ? Math.floor(value * 100) : 0
          onChange({ amount })
        }}
        style={{ width: 80 }}
        type="number"
        value={amount > 0 ? amount / 100 : ''}
      />
    </div>
    <TypeSelect
      category={category}
      onChange={onChange}
      paymentData={paymentData}
      type={type}
    />
    {paymentData.getIn([category, 'shape'], List()).map(field => (
      <DataField
        key={field.get('key')}
        field={field}
        onChange={(_, value) =>
          onChange({ data: Object.assign({}, data, { [name]: value }) })
        }
        value={(data && data[name]) || ''}
      />
    ))}
  </form>
)

export default InvoiceForm
