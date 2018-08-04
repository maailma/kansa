import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Divider from 'material-ui/Divider'
import { List, ListItem, makeSelectable } from 'material-ui/List'
import EventSeat from 'material-ui/svg-icons/action/event-seat'
import ThumbUp from 'material-ui/svg-icons/action/thumb-up'
import DirectionsRun from 'material-ui/svg-icons/maps/directions-run'
import DirectionsWalk from 'material-ui/svg-icons/maps/directions-walk'
import StarTicket from 'material-ui/svg-icons/maps/local-play'
import ChildFriendly from 'material-ui/svg-icons/places/child-friendly'
import SmilingFace from 'material-ui/svg-icons/social/mood'

import getMemberPrice from '../../lib/get-member-price'
import * as PaymentPropTypes from '../../payments/proptypes'

const SelectableList = makeSelectable(List)

export const memberTypeData = {
  Adult: {
    primary: 'Adult membership',
    daypass: 'Adult day pass (from €25/day)',
    icon: <DirectionsWalk />
  },
  FirstWorldcon: {
    primary: 'First Worldcon membership',
    secondary: 'Have never been a Worldcon member',
    icon: <StarTicket />
  },
  Youth: {
    primary: 'Youth membership',
    daypass: 'Youth day pass (from €15/day)',
    secondary: 'Born on or after 10 August 1991',
    icon: <DirectionsRun />
  },
  Child: {
    primary: 'Child membership',
    daypass: 'Child day pass (from €10/day)',
    secondary: 'Born on or after 10 August 2001',
    icon: <SmilingFace />
  },
  KidInTow: {
    primary: 'Kid-in-tow membership',
    secondary: 'Born on or after 10 August 2011',
    icon: <ChildFriendly />
  },
  Supporter: {
    primary: 'Supporting membership',
    icon: <EventSeat />
  },
  Upgrade: {
    primary: 'Upgrade membership',
    secondary: 'and/or add paper publications',
    icon: <ThumbUp />
  }
}

export default class MemberTypeList extends Component {
  static propTypes = {
    canAddPaperPubs: PropTypes.bool,
    data: PaymentPropTypes.data,
    disabled: PropTypes.bool,
    memberTypes: PropTypes.arrayOf(PropTypes.string),
    onSelectType: PropTypes.func.isRequired,
    prevType: PropTypes.string,
    selectedType: PropTypes.string,
    style: PropTypes.object
  }

  listItemProps(type) {
    const { canAddPaperPubs, category, data, disabled, prevType } = this.props
    const { primary, daypass, secondary, icon } = memberTypeData[type]
    const amount = getMemberPrice(data, prevType, type, false)
    const isDisabled = disabled || (prevType && amount < 0)
    const primaryText =
      category === 'daypass'
        ? daypass
        : amount < 0
          ? primary
          : amount > 0
            ? `${primary} (€${amount / 100})`
            : !prevType
              ? `${primary} (free)`
              : canAddPaperPubs
                ? 'No membership upgrade'
                : 'No upgrade available'
    const secondaryText =
      !prevType || amount
        ? secondary
        : canAddPaperPubs
          ? 'Just add paper publications'
          : 'Already has paper publications'
    return {
      disabled: isDisabled,
      innerDivStyle: { paddingLeft: 60 },
      leftIcon: icon,
      primaryText,
      secondaryText,
      style: isDisabled ? { opacity: 0.3 } : null,
      value: type
    }
  }

  render() {
    const { memberTypes, onSelectType, selectedType, style } = this.props
    return (
      <SelectableList
        onChange={(ev, type) => onSelectType(type)}
        style={style}
        value={selectedType}
      >
        {memberTypes.map(
          (type, i) =>
            type === '_divider' ? (
              <Divider
                key={'div' + i}
                style={{ marginTop: 8, marginBottom: 8, marginLeft: 60 }}
              />
            ) : (
              <ListItem key={type} {...this.listItemProps(type)} />
            )
        )}
      </SelectableList>
    )
  }
}
