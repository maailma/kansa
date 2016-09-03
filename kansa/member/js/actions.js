export const login = ({ email, people, roles }) => ({
  type: 'LOGIN',
  email,
  people,
  roles
});
