import React, { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');
import Divider from 'material-ui/Divider';
import { List, ListItem } from 'material-ui/List'
import EventSeat from 'material-ui/svg-icons/action/event-seat'
import DirectionsRun from 'material-ui/svg-icons/maps/directions-run'
import DirectionsWalk from 'material-ui/svg-icons/maps/directions-walk'
import StarTicket from 'material-ui/svg-icons/maps/local-play'
import ChildFriendly from 'material-ui/svg-icons/places/child-friendly'
import SmilingFace from 'material-ui/svg-icons/social/mood'

export const memberTypeData = {
  Adult: {
    primary: 'Adult membership',
    icon: <DirectionsWalk/>
  },
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

class MemberTypeListItem extends React.Component {
  static propTypes = {
    onSelectType: PropTypes.func.isRequired,
    prevType: PropTypes.string,
    prices: ImmutablePropTypes.map,
    type: PropTypes.string.isRequired,
    typeData: PropTypes.object.isRequired,
  }

  get amount() {
    const { prevType, prices, type } = this.props;
    if (!prices) return undefined;
    const prevAmount = prices.getIn(['memberships', prevType, 'amount']) || 0;
    const thisAmount = prices.getIn(['memberships', type, 'amount']) || 0;
    return thisAmount - prevAmount;
  }

  render() {
    const { onSelectType, prevType, type, typeData: { primary, secondary, icon } } = this.props;
    const amount = this.amount;
    const disabled = prevType && !(amount >= 0);  // negative or undefined
    const suffix = amount > 0 ? ` (€${amount / 100})` : amount === 0 ? ' (free)' : '';
    return <ListItem
      disabled={disabled}
      innerDivStyle={{ paddingLeft: 60 }}
      leftIcon={icon}
      onTouchTap={() => onSelectType(type)}
      primaryText={primary + suffix}
      secondaryText={secondary}
    />
  }
}

const MemberTypeList = ({ memberTypes, ...props }) => (
  <List style={{ paddingTop: 0 }}>
    {memberTypes.map((type, i) => (
      (type === '_divider')
        ? <Divider
            key={'div'+i}
            style={{ marginTop: 8, marginBottom: 8, marginLeft: 60 }}
          />
        : <MemberTypeListItem
            key={type}
            type={type}
            typeData={memberTypeData[type]}
            {...props}
          />
    ))}
  </List>
);

MemberTypeList.propTypes = {
  memberTypes: PropTypes.arrayOf(PropTypes.string),
  onSelectType: PropTypes.func.isRequired,
  prevType: PropTypes.string,
  prices: ImmutablePropTypes.map,
}

export default MemberTypeList;
