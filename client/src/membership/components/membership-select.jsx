import React from 'react'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

import messages from '../messages'

const MembershipSelect = ({ data, lc = 'en', onChange, value, ...props }) => {
  const memberTypes = data && data.getIn(['new_member', 'types'])
  if (!memberTypes) return null
  const items = memberTypes.entrySeq().sort((a, b) => {
    const aa = a[1].get('amount')
    const ba = b[1].get('amount')
    if (aa !== ba) return aa > ba ? -1 : 1
    return a[0] < b[0] ? -1 : 1
  })
  return (
    <SelectField
      errorText={memberTypes.has(value) ? '' : messages[lc].required()}
      floatingLabelFixed
      floatingLabelText={messages[lc].membership_type()}
      fullWidth
      onChange={(ev, idx, value) => onChange(value)}
      value={value}
      {...props}
    >
      {items.map(([key, type]) => {
        const amount = type.get('amount')
        const labelFn = messages[lc][key]
        const label = labelFn ? labelFn() : type.get('label') || key
        return (
          <MenuItem
            disabled={typeof amount !== 'number' || amount < 0}
            key={key}
            value={key}
            primaryText={amount <= 0 ? label : `${label} (€${amount / 100})`}
          />
        )
      })}
    </SelectField>
  )
}

export default MembershipSelect
