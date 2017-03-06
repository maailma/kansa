import React from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider';
import { List, ListItem } from 'material-ui/List'
import EventSeat from 'material-ui/svg-icons/action/event-seat'
import DirectionsRun from 'material-ui/svg-icons/maps/directions-run'
import DirectionsWalk from 'material-ui/svg-icons/maps/directions-walk'
import StarTicket from 'material-ui/svg-icons/maps/local-play'
import ChildFriendly from 'material-ui/svg-icons/places/child-friendly'
import SmilingFace from 'material-ui/svg-icons/social/mood'

const membershipData = {
  FirstWorldcon: {
    primary: 'First Worldcon membership',
    secondary: 'Have never been a Worldcon member',
    icon: <StarTicket/>
  },
  Youth: {
    primary: 'Youth membership',
    secondary: 'Born on or after 10 August 1991',
    icon: <DirectionsRun/>
  },
  Adult: {
    primary: 'Adult membership',
    icon: <DirectionsWalk/>
  },
  Child: {
    primary: 'Child membership',
    secondary: 'Born on or after 10 August 2001',
    icon: <SmilingFace/>
  },
  KidInTow: {
    primary: 'Kid-in-tow membership',
    secondary: 'Born on or after 10 August 2011',
    icon: <ChildFriendly/>
  },
  Supporter: {
    primary: 'Supporting membership',
    icon: <EventSeat/>
  }
};

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
        granted supporting membership. Supporting memberships may be upgraded to
        attending memberships.
      </p>
    </div>,
    expandable: true,
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
        convention. Supporting members may upgrade their membership for the
        current difference in the membership costs.
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
  }
};

const NewMemberCard = ({ category, prices, push }) => {
  const { title, body, expandable = false, memberships } = contents[category];
  return <Card
    style={{ marginBottom: 24 }}
  >
    <CardHeader
      actAsExpander={expandable}
      showExpandableButton={expandable}
      title={title}
      style={{ fontWeight: 600 }}
    />
    <CardText
      expandable={expandable}
      style={{ paddingTop: 0 }}
    >
      { body }
    </CardText>
    <CardActions style={{ marginLeft: 8, paddingTop: 0 }}>
      <List style={{ paddingTop: 0 }}>
        { memberships.map((type, i) => {
          if (type === '_divider') return <Divider
            key={`div${i}`}
            style={{ marginTop: 8, marginBottom: 8, marginLeft: 60 }}
          />;
          const { primary, secondary, icon } = membershipData[type];
          const amount = prices && prices.getIn(['memberships', type, 'amount']);
          const suffix = amount > 0 ? ` (€${amount / 100})`
            : amount === 0 ? ' (free)' : '';
          return <ListItem
            key={type}
            innerDivStyle={{ paddingLeft: 60 }}
            leftIcon={icon}
            onTouchTap={ () => push(`/new/${type}`) }
            primaryText={primary + suffix}
            secondaryText={secondary}
          />
        })}
      </List>
    </CardActions>
  </Card>;
}

NewMemberCard.propTypes = {
  category: React.PropTypes.string.isRequired,
  prices: ImmutablePropTypes.map,
  push: React.PropTypes.func.isRequired,
}

export default NewMemberCard;