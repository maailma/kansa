export const login = ({ email, people, roles }) => ({
  type: 'LOGIN',
  email,
  people,
  roles
});

export const logout = () => ({
  type: 'LOGOUT'
});

export const memberUpdate = (id, changes) => ({
  type: 'MEMBER_UPDATE',
  id,
  changes
});
