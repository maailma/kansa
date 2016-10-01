export const keyLogin = (email, key) => ({
  type: 'KEY_LOGIN',
  email,
  key
});

export const keyRequest = (email) => ({
  type: 'KEY_REQUEST',
  email
});

export const tryLogin = (callback) => ({
  type: 'TRY_LOGIN',
  callback
});

export const logout = () => ({
  type: 'LOGOUT'
});

