export const keyLogin = (email, key) => ({
  type: 'KEY_LOGIN',
  email,
  key
});

export const keyRequest = (email) => ({
  type: 'KEY_REQUEST',
  email
});

export const tryLogin = () => ({
  type: 'TRY_LOGIN'
});

export const logout = () => ({
  type: 'LOGOUT'
});

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

export const showMessage = (message) => ({
  type: 'SHOW_MESSAGE',
  message
});

export const hideMessage = () => ({
  type: 'HIDE_MESSAGE'
});
