import { fromJS, List } from 'immutable'

const fixPerson = (person) => {
  if (!person) return null
  if (person && person.member_number) person.member_number = parseInt(person.member_number)
  if (person && person.membership === 'NonMember' && person.daypass) {
    const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      .filter((day, i) => person.daypass_days[i])
      .join('/')
    person.membership = `DP ${person.daypass} ${days}`
  }
  [
    'legal_name', 'email',
    'badge_name', 'badge_subtitle',
    'public_first_name', 'public_last_name',
    'city', 'state', 'country'
  ].forEach(key => {
    if (!person[key]) person[key] = ''
  })
  return person
}

export default function (state = List(), action) {
  if (action.error) return state
  switch (action.type) {
    case 'INIT PEOPLE':
      if (!Array.isArray(action.data)) {
        console.warn(`${action.type} expects array data (got ${typeof action.data})`, action.data)
        return state
      }
      action.data.forEach(fixPerson)
      return fromJS(action.data)

    case 'SET PERSON':
      const id = parseInt(action.data.id)
      if (isNaN(id) || id < 0) {
        console.warn(`${action.type} expects positive integer id`, action.data)
        return state
      }
      const person = fixPerson(action.data)
      return state.set(id, fromJS(person))

    case 'LOGOUT':
      return List()
  }
  return state
}
