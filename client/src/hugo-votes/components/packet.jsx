import React, { PropTypes } from 'react'

import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'

import { midGray } from '../../theme'
import { packet as packetPropType } from '../proptypes'

const PacketFormatMenu = ({ epub, mobi, pdf, onSelectFormat }) => (
  <IconMenu
    iconButtonElement={
      <IconButton
        tooltip="Select format"
        tooltipPosition="bottom-left"
      ><MoreVertIcon color={midGray} /></IconButton>
    }
    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
    targetOrigin={{ horizontal: 'right', vertical: 'top' }}
  >
    <MenuItem
      disabled={!epub}
      onTouchTap={() => onSelectFormat('epub')}
    >{epub && epub.get('label') || 'EPUB'}</MenuItem>
    <MenuItem
      disabled={!mobi}
      onTouchTap={() => onSelectFormat('mobi')}
    >{mobi && mobi.get('label') || 'MOBI'}</MenuItem>
    <MenuItem
      disabled={!pdf}
      onTouchTap={() => onSelectFormat('pdf')}
    >{pdf && pdf.get('label') || 'PDF'}</MenuItem>
  </IconMenu>
)

const Packet = ({ epub, mobi, pdf, onSelectFormat, format }) => {
  if (!epub && !mobi && !pdf) return null
  const fmt = format === 'epub' && epub ? epub
    : format === 'mobi' && mobi ? mobi
    : pdf || epub || mobi
  return (
    <div style={{
      alignItems: 'center', display: 'flex', flexGrow: 1,
      justifyContent: 'flex-end'
    }}>
      <FlatButton
        download href={fmt.get('url')}
        label={`Download packet (${fmt.get('label')})`}
        style={{ lineHeight: '33px' }}
      />
      <PacketFormatMenu
        epub={epub} mobi={mobi} pdf={pdf}
        onSelectFormat={onSelectFormat}
      />
    </div>
  )
}

Packet.propTypes = {
  epub: packetPropType,
  mobi: packetPropType,
  pdf: packetPropType,
  onSelectFormat: PropTypes.func.isRequired,
  format: PropTypes.string
}

export default Packet
