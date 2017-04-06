import React, { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'

import MemberTypeList from './MemberTypeList'

const contents = {
  all: {
    title: 'Buy new membership',
    body: <div>
      <p>
        Persons who have never been attending or supporting members of any
        previous Worldcon are eligible for a <b>First Worldcon</b> attending
        membership of Worldcon 75.
      </p><p>
        <b>Child</b> members are not eligible to participate in the Hugo Awards
        or Site Selection processes.
      </p><p>
        A <b>Supporting</b> membership of Worldcon 75 grants you the right to
        participate in the functions of the World Science Fiction Society (Hugo
        Awards and Site Selection), but does not grant general admission to the
        convention.
      </p><p>
        Participants of the 2017 Worldcon Site Selection have been automatically
        granted supporting membership.
      </p>
    </div>,
    memberships: [
      'FirstWorldcon', 'Youth', 'Adult', '_divider',
      'Child', 'KidInTow', '_divider',
      'Supporter'
    ]
  },

  attend: {
    title: 'New attending membership',
    body: <div>
      <p>
        Persons who have never been attending or supporting members of any
        previous Worldcon are eligible for a <b>First Worldcon</b> attending
        membership of Worldcon 75.
      </p><p>
        Persons born on 10 August 1991 or later qualify for <b>Youth</b>{' '}
        attending memberships of Worldcon 75 (€100).
      </p><p>
        All attending memberships carry the same rights as supporting
        memberships, in addition to the right of general admission to the
        convention.
      </p>
    </div>,
    memberships: ['FirstWorldcon', 'Youth', 'Adult']
  },

  child: {
    title: 'New child/kid-in-tow membership',
    body: <div>
      <p>
        <b>Child</b> and <b>Kid-in-tow</b> members are not eligible to
        participate in the Hugo Awards or Site Selection processes.
      </p>
    </div>,
    memberships: [ 'Child', 'KidInTow' ]
  },

  support: {
    title: 'New supporting membership',
    body: <div>
      <p>
        A non-attending membership of Worldcon 75 which will grant you the right
        to participate in the functions of the World Science Fiction Society
        (Hugo Awards and Site Selection).
      </p><p>
        Participants of the 2017 Worldcon Site Selection have been automatically
        granted supporting membership. Supporting memberships may be upgraded to
        attending memberships.
      </p>
    </div>,
    memberships: [ 'Supporter' ]
  },

  upgrade: {
    title: 'Upgrade membership',
    body: <div>
      <p>
        <b>Supporting</b> and other memberships may be upgraded to attending
        memberships for the current difference in membership costs. To upgrade
        your own or someone else's membership, you'll need to be logged in to
        our services.
      </p>
    </div>,
    memberships: [ 'Upgrade' ]
  }
};

const NewMemberCard = ({ category, disabled = false, expandable = false, onSelectType, prices }) => {
  const { title, body, memberships } = contents[category];
  return <Card
    style={{ marginBottom: 24 }}
  >
    <CardHeader
      actAsExpander={expandable}
      className="action-head"
      showExpandableButton={expandable}
      textStyle={{ paddingRight: 0 }}
      title={title}
      style={{ fontWeight: 600, marginBottom: 16 }}
    />
    <CardText
      expandable={expandable}
      style={{ paddingTop: 0 }}
    >
      { body }
    </CardText>
    <CardActions style={{ marginLeft: 8, paddingTop: 0 }}>
      <MemberTypeList
        disabled={disabled}
        memberTypes={memberships}
        onSelectType={onSelectType}
        prices={prices}
        style={{ paddingTop: 0 }}
      />
    </CardActions>
  </Card>;
}

NewMemberCard.propTypes = {
  category: PropTypes.oneOf(Object.keys(contents)).isRequired,
  onSelectType: PropTypes.func.isRequired,
  prices: ImmutablePropTypes.map,
}

export default NewMemberCard;
