import { fromJS, Map } from 'immutable';

export default function(state = Map(), action) {
  if (action.error) return state;
  switch (action.type) {

    case 'LOGIN':
      const { email, people, roles } = action;
      return fromJS({
        email,
        member: people && people[0],
        admin: roles && roles.indexOf('member_admin') != -1
      });

    case 'LOGOUT':
      return Map();

  }
  return state;
}
