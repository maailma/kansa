import { Map } from 'immutable'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'
import React from 'react'

const styles = {
  common: { }
}

const TypeSelect = ({ category, onChange, paymentData, type }) => {
  const cache = {}
  return (
    <SelectField
      floatingLabelFixed
      floatingLabelText='Payment type'
      onChange={(ev, idx, type) => {
        let update = cache[type]
        if (update.category !== category) update = Object.assign({ data: {} }, update)
        onChange(update)
      }}
      style={styles.common}
      value={type}
    >
      {
        paymentData.reduce((list, data, category) => {
          list.push(<MenuItem
            disabled
            key={category}
            primaryText={`== ${category}`}
            value={category}
          />)
          data.get('types').forEach(type => {
            const key = type.get('key')
            list.push(<MenuItem
              key={key}
              primaryText={type.get('label')}
              value={key}
            />)
            cache[key] = { amount: type.get('amount'), category, type: key }
          })
          return list
        }, [])
      }
    </SelectField>
  )
}

const DataField = ({ field, name, onChange, style = {}, value }) => {
  const isNumber = field.get('type') === 'number'
  let label = field.get('label')
  if (field.get('required')) label += ' (Required)'
  return <TextField
    floatingLabelFixed
    floatingLabelText={label}
    fullWidth
    multiLine={!isNumber}
    name={name}
    onChange={onChange}
    style={{ ...styles.common, ...style }}
    type={isNumber ? 'number' : null}
    value={value}
  />
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
        floatingLabelText='Amount'
        name='amount'
        onChange={(_, value) => {
          const amount = value ? Math.floor(value * 100) : 0
          onChange({ amount })
        }}
        style={{ width: 80 }}
        type='number'
        value={amount > 0 ? amount / 100 : ''}
      />
    </div>
    <TypeSelect
      category={category}
      onChange={onChange}
      paymentData={paymentData}
      type={type}
    />
    {paymentData.getIn([category, 'shape'], Map()).entrySeq().map(([name, field]) => (
      <DataField
        key={name}
        field={field}
        name={name}
        onChange={(_, value) => onChange({ data: Object.assign({}, data, { [name]: value }) })}
        value={data && data[name] || ''}
      />
    ))}
    <TextField
      floatingLabelFixed
      floatingLabelText='Invoice number'
      fullWidth
      name='invoice'
      onChange={(_, invoice) => onChange({ invoice })}
      style={styles.common}
      type='number'
      value={invoice}
    />
    <TextField
      floatingLabelFixed
      floatingLabelText='Comments'
      fullWidth
      multiLine
      name='comments'
      onChange={(_, comments) => onChange({ comments })}
      rows={2}
      style={styles.common}
      type='number'
      value={comments}
    />
  </form>
)

export default InvoiceForm
