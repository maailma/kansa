export const keyLogin = (email, key, path) => ({
  type: 'KEY_LOGIN',
  email,
  key,
  path
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

