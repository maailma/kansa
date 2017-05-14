import React, { PropTypes } from 'react'
import FlatButton from 'material-ui/FlatButton'

import { midGray } from '../../theme'
import { categoryPacket } from '../proptypes'

const Packet = ({ formats }) => {
  if (!formats || formats.size === 0) return null
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flexGrow: 1
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ color: midGray, fontSize: 14, marginRight: 8, marginTop: 8 }}>Download packet</div>
        <FlatButton
          download href={formats.first().get('url')}
          label={formats.first().get('label')}
          style={{ lineHeight: '33px' }}
        />
      </div>
      {formats.rest().valueSeq().map((fmt, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FlatButton
            download href={fmt.get('url')}
            label={fmt.get('label')}
            style={{ lineHeight: '33px' }}
          />
        </div>
      ))}
    </div>
  )
}

Packet.propTypes = {
  formats: categoryPacket
}

export default Packet
