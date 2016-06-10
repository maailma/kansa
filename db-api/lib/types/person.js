const util = require('../util');

class Person {
  static get fields() {
    return [
      // id SERIAL PRIMARY KEY
      'last_modified',  // timestamptz DEFAULT now()
      'legal_name',  // text NOT NULL
      'membership',  // MembershipStatus NOT NULL
      'member_number',  // integer
      'public_first_name', 'public_last_name',  // text
      'email',  // text
      'city', 'state', 'country',  // text
      'badge_text',  // text
      'can_hugo_nominate', 'can_hugo_vote', 'can_site_select'  // bool NOT NULL DEFAULT false
    ];
  }

  static get boolFields() {
    return [ 'can_hugo_nominate', 'can_hugo_vote', 'can_site_select' ];
  }

  static get userTextFields() {
    return [ 'legal_name', 'public_first_name', 'public_last_name', 'city', 'state', 'country' ];
  }

  static get membershipTypes() {
    return [ 'NonMember', 'Supporter', 'KidInTow', 'Child', 'Youth',
             'FirstWorldcon', 'Adult' ];
  }

  constructor(src) {
    if (!src || !src.legal_name || !src.membership) throw new Error('Missing data for new Person (required: legal_name, membership)');
    if (Person.membershipTypes.indexOf(src.membership) === -1) throw new Error('Invalid membership type for new Person');
    this.data = Object.assign({}, src);
    Person.boolFields.forEach(fn => util.forceBool(this.data, fn));
    util.forceInt(this.data, 'member_number');
  }

  get sqlValues() {
    const fields = Person.fields.filter(fn => this.data.hasOwnProperty(fn));
    const values = fields.map(fn => `$(${fn})`).join(', ');
    return `(${fields.join(', ')}) VALUES(${values})`;
  }
}

module.exports = Person;
