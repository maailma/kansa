import FlatButton from 'material-ui/FlatButton'
import React from 'react'
import { connect } from 'react-redux'

import { disabledColor } from '../../theme/colors'
import { getHugoPacketSeriesExtra } from '../actions'
import { categoryPacket } from '../proptypes'

const Packet = ({ category, formats, getHugoPacketSeriesExtra }) => {
  if (!formats || formats.size === 0) return null
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div
          style={{ color: disabledColor, fontSize: 14, marginRight: 8, marginTop: 8 }}
        >
          Download packet
        </div>
        <FlatButton
          download
          href={formats.first().get('url')}
          label={formats.first().get('label')}
          style={{ lineHeight: '33px' }}
        />
      </div>
      {formats
        .rest()
        .valueSeq()
        .map((fmt, idx) => (
          <div
            key={idx}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <FlatButton
              download
              href={fmt.get('url')}
              label={fmt.get('label')}
              style={{ lineHeight: '33px' }}
            />
          </div>
        ))}
      {category === 'Series' && (
        <div
          key="extra"
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <FlatButton
            label="Get Steam Token for The Craft Sequence games"
            onClick={getHugoPacketSeriesExtra}
            style={{ lineHeight: '33px' }}
          />
        </div>
      )}
    </div>
  )
}

Packet.propTypes = {
  formats: categoryPacket
}

export default connect(
  null,
  { getHugoPacketSeriesExtra }
)(Packet)
