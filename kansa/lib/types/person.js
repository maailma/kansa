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
      'badge_name', 'badge_subtitle',  // text
      'hugo_nominator', 'hugo_voter',  // bool
      'paper_pubs',  // jsonb
      'daypass',  // string
      'daypass_days'  // int[]
    ];
  }

  static get boolFields() {
    return [ 'hugo_nominator', 'hugo_voter' ];
  }

  static hugoVoterType(membership) {
    return [ 'Supporter', 'Youth', 'Unwaged', 'Adult' ].indexOf(membership) !== -1
  }

  static get userModFields() {
    return [ 'legal_name', 'public_first_name', 'public_last_name', 'city', 'state', 'country', 'badge_name', 'badge_subtitle', 'paper_pubs' ];
  }

  static get membershipTypes() {
    return [ 'NonMember', 'Exhibitor', 'Helper', 'Supporter', 'KidInTow', 'Child', 'Youth', 'Unwaged', 'Adult' ];
  }

  static get paperPubsFields() {
    return [ 'name', 'address', 'country' ];  // text
  }

  static cleanMemberType(ms) {
    if (Person.membershipTypes.indexOf(ms) > -1) return ms;
    throw new Error('Invalid membership type: ' + JSON.stringify(ms));
  }

  static cleanPaperPubs(pp) {
    if (!util.isTrueish(pp)) return null;
    if (typeof pp == 'string') pp = JSON.parse(pp);
    return Person.paperPubsFields.reduce((o, fn) => {
      if (!pp[fn]) throw new Error('If non-null, paper_pubs requires: ' + Person.paperPubsFields.join(', '));
      o[fn] = pp[fn];
      return o;
    }, {});
  }

  constructor(src) {
    if (!src || !src.legal_name || !src.membership) throw new Error('Missing data for new Person (required: legal_name, membership)');
    this.data = Object.assign({}, src);
    Person.cleanMemberType(this.data.membership);
    Person.boolFields.forEach(fn => util.forceBool(this.data, fn));
    util.forceInt(this.data, 'member_number');
    if (this.data.membership === 'NonMember') this.data.member_number = null;
    this.data.paper_pubs = Person.cleanPaperPubs(this.data.paper_pubs);
  }

  get hugoVoterType() {
    return Person.hugoVoterType(this.data.membership)
  }

  get passDays() {
    return Object.keys(this.data).filter(key => /^day\d+$/.test(key) && this.data[key])
  }

  get preferredName() {
    const { legal_name, public_first_name, public_last_name } = this.data;
    return [public_first_name, public_last_name].filter(n => n).join(' ').trim() || legal_name;
  }

  get sqlValues() {
    const fields = Person.fields.filter(fn => this.data.hasOwnProperty(fn));
    const values = fields.map(fn => `$(${fn})`).join(', ');
    return `(${fields.join(', ')}) VALUES(${values})`;
  }
}

module.exports = Person;
