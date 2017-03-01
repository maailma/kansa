import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'

const MemberMenu = ({ id, push, ...props }) => <IconMenu
  iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
  anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
  targetOrigin={{ horizontal: 'right', vertical: 'top' }}
  { ...props }
>
  <MenuItem
    onTouchTap={ () => push(`/exhibition/${id}`) }
    primaryText='Register for the Art Show'
  />
</IconMenu>;

export default connect(null, { push })(
  MemberMenu
);
