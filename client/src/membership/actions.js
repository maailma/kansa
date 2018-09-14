// query: Map({ email, member_number, name })
export const memberLookup = query => ({
  module: 'kansa',
  type: 'MEMBER_LOOKUP',
  query
})

export const memberSet = ({ email, people, roles }) => ({
  module: 'kansa',
  type: 'MEMBER_SET',
  email,
  people,
  roles
})

export const memberUpdate = (id, changes) => ({
  module: 'kansa',
  type: 'MEMBER_UPDATE',
  id,
  changes
})

export const requestSlackInvite = () => ({
  module: 'kansa',
  type: 'REQUEST_SLACK_INVITE'
})
