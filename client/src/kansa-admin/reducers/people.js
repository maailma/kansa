import { fromJS, List } from 'immutable';

export default function(state = List(), action) {
  if (action.error) return state;
  switch (action.type) {

    case 'INIT PEOPLE':
      if (!Array.isArray(action.data)) {
        console.warn(`${action.type} expects array data (got ${typeof action.data})`, action.data);
        return state;
      }
      action.data.forEach(person => {
        if (person && person.member_number) person.member_number = parseInt(person.member_number)
        if (person && person.membership === 'NonMember' && person.daypass) {
          const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            .filter((day, i) => person.daypass_days[i])
            .join('/')
          person.membership = `DP ${person.daypass} ${days}`
        }
      })
      return fromJS(action.data);

    case 'SET PERSON':
      const id = parseInt(action.data.id);
      if (isNaN(id) || id < 0) {
        console.warn(`${action.type} expects positive integer id`, action.data);
        return state;
      }
      if (action.data.member_number) action.data.member_number = parseInt(action.data.member_number);
      [
        'legal_name', 'email', 'public_first_name', 'public_last_name',
        'city', 'state', 'country'
      ].forEach(key => {
        if (!action.data[key]) action.data[key] = '';
      })
      return state.set(id, fromJS(action.data));

    case 'LOGOUT':
      return List();

  }
  return state;
}
