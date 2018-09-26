import React from 'react'
import BadgeEdit from './edit'

export default function BadgeModule() {
  const memberFormFields = ({ badge }, member, editProps) =>
    badge && !member.get('daypass') ? (
      <BadgeEdit key="15-badge" {...editProps} />
    ) : null
  return { memberFormFields }
}
