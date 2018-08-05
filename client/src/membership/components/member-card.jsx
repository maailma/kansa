import React from 'react'
import { Card, CardHeader, CardActions } from 'material-ui/Card'
import * as MemberPropTypes from '../proptypes'
import MemberActions from './member-actions'
import { ConfigConsumer } from '../../lib/config-context'

function cardTitle(member, membershipTypes) {
  const ms = member.get('membership')
  const attr = membershipTypes && membershipTypes[ms]
  if (attr && attr.member) return `${ms} member #${member.get('member_number')}`
  const daypass = member.get('daypass')
  if (daypass) {
    const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      .filter((day, i) => member.getIn(['daypass_days', i]))
      .join('/')
    return `${daypass} day pass ${days}`
  }
  return attr && attr.hugo_nominator ? 'Hugo nominator' : 'Non-member'
}

const MemberCard = ({ member }) =>
  member ? (
    <Card style={{ marginBottom: 18 }}>
      <ConfigConsumer>
        {({ membershipTypes }) => (
          <CardHeader
            title={member.get('legal_name')}
            style={{ fontWeight: 600 }}
            subtitle={cardTitle(member, membershipTypes)}
          />
        )}
      </ConfigConsumer>
      <CardActions style={{ marginLeft: 8, paddingTop: 0 }}>
        <MemberActions member={member} />
      </CardActions>
    </Card>
  ) : null

MemberCard.propTypes = {
  member: MemberPropTypes.person
}

export default MemberCard
