import React, { PropTypes } from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');
import Divider from 'material-ui/Divider';
import { List, ListItem, makeSelectable } from 'material-ui/List'
import EventSeat from 'material-ui/svg-icons/action/event-seat'
import DirectionsRun from 'material-ui/svg-icons/maps/directions-run'
import DirectionsWalk from 'material-ui/svg-icons/maps/directions-walk'
import StarTicket from 'material-ui/svg-icons/maps/local-play'
import ChildFriendly from 'material-ui/svg-icons/places/child-friendly'
import SmilingFace from 'material-ui/svg-icons/social/mood'

const SelectableList = makeSelectable(List);

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

export default class MemberTypeList extends React.Component {
  static propTypes = {
    memberTypes: PropTypes.arrayOf(PropTypes.string),
    onSelectType: PropTypes.func.isRequired,
    prevType: PropTypes.string,
    prices: ImmutablePropTypes.map,
    selectedType: PropTypes.string,
    style: PropTypes.object
  }

  getAmount(type) {
    const { prevType, prices } = this.props;
    if (!prices) return undefined;
    const prevAmount = prices.getIn(['memberships', prevType, 'amount']) || 0;
    const thisAmount = prices.getIn(['memberships', type, 'amount']) || 0;
    return thisAmount - prevAmount;
  }

  render() {
    const { memberTypes, onSelectType, prevType, selectedType, style } = this.props;
    return (
      <SelectableList
        onChange={(ev, type) => onSelectType(type)}
        style={style}
        value={selectedType}
      >
        {memberTypes.map((type, i) => {
          if (type === '_divider') return (<Divider
            key={'div'+i}
            style={{ marginTop: 8, marginBottom: 8, marginLeft: 60 }}
          />);
          const { primary, secondary, icon } = memberTypeData[type];
          const amount = this.getAmount(type);
          const disabled = prevType && !(amount >= 0);  // negative or undefined
          const suffix = amount > 0 ? ` (€${amount / 100})` : amount === 0 ? ' (free)' : '';
          return (<ListItem
            disabled={disabled}
            innerDivStyle={{ paddingLeft: 60 }}
            key={type}
            leftIcon={icon}
            primaryText={primary + suffix}
            secondaryText={secondary}
            value={type}
          />);
        })}
      </SelectableList>
    );
  }
}
