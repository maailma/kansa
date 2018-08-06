import React from 'react'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

import getMemberPrice from '../../lib/get-member-price'
import { membershipTypes } from '../constants'
import messages from '../messages'

const MembershipSelect = ({
  data,
  getDefaultValue,
  getValue,
  lc = 'en',
  onChange,
  style
}) => {
  const path = ['membership']
  const prevMembership = getDefaultValue && getDefaultValue(path)
  const prevIdx = membershipTypes.indexOf(prevMembership)
  const value = getValue(path) || 'NonMember'
  return (
    <SelectField
      errorText={
        value === 'NonMember' && prevMembership !== 'NonMember'
          ? messages[lc].required()
          : ''
      }
      floatingLabelFixed
      floatingLabelText={messages[lc].membership_type()}
      fullWidth
      onChange={(ev, idx, value) => onChange(path, value)}
      style={style}
      value={value}
    >
      {membershipTypes.map((type, idx) => {
        if (type === 'NonMember' && prevMembership !== 'NonMember') return null
        if (type === 'Exhibitor' && prevMembership !== 'Exhibitor') return null
        if (type === 'Helper' && prevMembership !== 'Helper') return null
        const amount = getMemberPrice(data, prevMembership, type)
        let label
        if (messages[lc][type]) {
          label = messages[lc][type]()
        } else {
          const typeLabel =
            data && data.getIn(['new_member', 'types', type, 'label'])
          label = typeLabel || type
        }
        return (
          <MenuItem
            key={type}
            disabled={amount < 0 || idx < prevIdx}
            value={type}
            primaryText={amount <= 0 ? label : `${label} (€${amount / 100})`}
          />
        )
      })}
    </SelectField>
  )
}

export default MembershipSelect
