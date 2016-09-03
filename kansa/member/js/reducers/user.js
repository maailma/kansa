import { fromJS, Map } from 'immutable';

export default function(state = Map(), action) {
  if (action.error) return state;
  switch (action.type) {

    case 'LOGOUT':
      return Map();

    case 'MEMBER_SET':
      const { email, people, roles } = action;
      return fromJS({
        email,
        member: people && people[0],
        admin: roles && roles.indexOf('member_admin') != -1
      });

    case 'MEMBER_UPDATE':
      return state.mergeIn(['member'], action.changes);

  }
  return state;
}
