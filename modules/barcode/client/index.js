import React from 'react'
import ShowBarcode from './show-barcode'

export default function BarcodeModule(config) {
  const actions = ({ badge }, member) =>
    badge || member.get('daypass') ? (
      <ShowBarcode
        key="15-barcode"
        eventId={config.id}
        memberId={member.get('id')}
      />
    ) : null
  return { actions }
}
