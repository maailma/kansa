export const memberSet = ({ email, people, roles }) => ({
  type: 'MEMBER_SET',
  email,
  people,
  roles
});

export const memberUpdate = (id, changes) => ({
  type: 'MEMBER_UPDATE',
  id,
  changes
});
