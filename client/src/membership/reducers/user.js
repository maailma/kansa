import { fromJS, Map } from 'immutable';
import { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { membershipTypes } from '../constants'

const PaperPubsPropType = ImmutablePropTypes.mapContains({
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired
});

const PersonPropType = ImmutablePropTypes.mapContains({
  id: PropTypes.number.isRequired,
  last_modified: PropTypes.string.isRequired,
  membership: PropTypes.oneOf(membershipTypes).isRequired,
  member_number: PropTypes.string,
  legal_name: PropTypes.string.isRequired,
  public_first_name: PropTypes.string,
  public_last_name: PropTypes.string,
  email: PropTypes.string,
  city: PropTypes.string,
  state: PropTypes.string,
  country: PropTypes.string,
  can_hugo_nominate: PropTypes.bool,
  can_hugo_vote: PropTypes.bool,
  can_site_select: PropTypes.bool,
  paper_pubs: PaperPubsPropType
});

export const PersonPropTypes = {
  paperPubs: PaperPubsPropType,
  person: PersonPropType,
  people: ImmutablePropTypes.listOf(PersonPropType)
}

export default function(state = Map(), action) {
  if (action.error) return state;
  switch (action.type) {

    case 'LOGOUT':
      return Map();

    case 'MEMBER_SET': {
      const { email, people, roles } = action;
      return fromJS({
        email,
        people,
        hugoAdmin: roles && roles.indexOf('hugo_admin') !== -1,
        memberAdmin: roles && roles.indexOf('member_admin') !== -1
      });
    }

    case 'MEMBER_UPDATE': {
      const { id, changes } = action;
      const key = state.get('people').findKey(p => p.get('id') === id);
      if (typeof key !== 'number') return state;
      return state.mergeIn(['people', key], changes);
    }

  }
  return state;
}
