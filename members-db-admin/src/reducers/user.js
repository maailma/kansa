import { List, Map } from 'immutable';

export default function(state = Map(), action) {
  if (action.error) return state;
  switch (action.type) {

    case 'LOGIN':
      return Map({
        email: action.data.email,
        people: List((action.data.people || {}).map(p => p.id)),
        member_admin: action.data.roles && action.data.roles.indexOf('member_admin') != -1,
        admin_admin: action.data.roles && action.data.roles.indexOf('admin_admin') != -1
      });

    case 'LOGOUT':
      return Map();

  }
  return state;
}

