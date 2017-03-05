import React from 'react'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { isFullMemberType } from '../constants'
import MemberEdit from './MemberEdit'
import Upgrade from './Upgrade'

const location = (member) => (
  [member.get('city'), member.get('state'), member.get('country')]
  .filter(n => n)
  .join(', ')
  .trim()
);

const publicName = (member) => (
  [member.get('public_first_name'), member.get('public_last_name')]
    .filter(n => n)
    .join(' ')
    .trim()
);

const Member = ({ member, push, showHugoActions }) => {
  if (!member) return null;
  const id = member.get('id');
  const membership = member.get('membership', 'NonMember');
  const infoStyle = { color: 'rgba(0, 0, 0, 0.870588)' };

  return <Card style={{ marginBottom: 24 }}>
    <CardHeader
      title={ member.get('legal_name') }
      subtitle={ membership === 'NonMember'
          ? 'Non-member' + (member.get('can_hugo_nominate') ? ' (Hugo nominator)' : '')
          : `${membership} member #${member.get('member_number')}` }
    />
    <CardText>
      <List>
        <MemberEdit member={member}>
          <ListItem
            primaryText="Edit personal information"
            secondaryText={<p>
              Public name: <span style={infoStyle}>{publicName(member) || '[not set]'}</span><br/>
              Location: <span style={infoStyle}>{location(member) || '[not set]'}</span>
            </p>}
            secondaryTextLines={2}
          />
        </MemberEdit>
        <Upgrade member={member}>
          <ListItem
            primaryText="Upgrade membership"
            secondaryText="and/or add paper publications"
          />
        </Upgrade>
        { showHugoActions ? <ListItem
            onTouchTap={() => push(`/hugo/${id}/nominate`)}
            primaryText="Nominate for the Hugo Awards"
          /> : null }
        { isFullMemberType(membership) ? <ListItem
          onTouchTap={ () => push(`/exhibition/${id}`) }
          primaryText="Register for the Art Show"
        /> : null }
      </List>
    </CardText>
  </Card>;
}

Member.propTypes = {
  member: ImmutablePropTypes.mapContains({
    paper_pubs: ImmutablePropTypes.map
  }),
  push: React.PropTypes.func.isRequired,
  showHugoActions: React.PropTypes.bool
}

export default Member;