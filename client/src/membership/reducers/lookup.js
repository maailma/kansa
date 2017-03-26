import { fromJS, Map } from 'immutable';
import { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { membershipTypes } from '../constants'

const queryPropType = ImmutablePropTypes.mapContains({
  email: PropTypes.string,
  member_number: PropTypes.string,
  name: PropTypes.string
});

const resultsPropType = ImmutablePropTypes.mapContains({
  status: PropTypes.oneOf(['multiple', 'not found', 'success']).isRequired,
  id: PropTypes.number,
  membership: PropTypes.oneOf(membershipTypes),
  name: PropTypes.string
});

// { [query]: results }
export const LookupPropTypes = {
  lookup: ImmutablePropTypes.mapOf(resultsPropType, queryPropType),
  query: queryPropType,
  results: resultsPropType
}

export default function(state = Map(), action) {
  if (action.error) return state;
  switch (action.type) {

    case 'MEMBER_LOOKUP': {
      const { query, results } = action;
      return state.set(query, fromJS(results));
    }

  }
  return state;
}
