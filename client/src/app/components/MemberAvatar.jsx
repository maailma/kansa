import React from 'react'
import Avatar from 'material-ui/Avatar'
import Gravatar from 'react-gravatar'

const initials = (name) => name.split(/\s+/).map(w => w.charAt(0)).join('')

const MemberAvatar = ({ member, single = false, size = 40, style = {}, ...props }) => {
  const name = member.get('legal_name')
  return <Avatar
    size={size}
    style={Object.assign({
      display: 'flex',
      fontWeight: 600,
      overflow: 'hidden'
    }, style)}
    title={name}
    {...props}
  >
    { single ? <Gravatar default='identicon' email={member.get('email')} size={size} /> : initials(name) }
  </Avatar>
}

export default MemberAvatar
