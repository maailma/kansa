import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { Card, CardHeader, CardActions } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'
import ThumbUp from 'material-ui/svg-icons/action/thumb-up'
import ContentCreate from 'material-ui/svg-icons/content/create'
import Palette from 'material-ui/svg-icons/image/palette'
import LocationCity from 'material-ui/svg-icons/social/location-city'
const ImmutablePropTypes = require('react-immutable-proptypes')

import Rocket from '../../lib/rocket-icon'
import { isWSFSMember } from '../constants'
import MemberEdit from './MemberEdit'

const location = (member) => (
  [member.get('city'), member.get('state'), member.get('country')]
    .filter(n => n)
    .join(', ')
    .trim()
)

const publicName = (member) => (
  [member.get('public_first_name'), member.get('public_last_name')]
    .filter(n => n)
    .join(' ')
    .trim()
)

const Action = (props) => (
  <ListItem
    innerDivStyle={{ paddingLeft: 60 }}
    { ...props }
  />
)

class MemberCard extends React.Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    push: React.PropTypes.func.isRequired,
    showHugoActions: React.PropTypes.bool
  }

  get actions() {
    const { member, push, showHugoActions } = this.props
    const id = member.get('id')
    const infoStyle = { color: 'rgba(0, 0, 0, 0.870588)' }
    const actions = [
      <MemberEdit key="ed" member={member}>
        <Action
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<ContentCreate style={{ top: 12 }}/>}
          primaryText="Edit personal information"
          secondaryText={<p>
            Public name: <span style={infoStyle}>{publicName(member) || '[not set]'}</span><br/>
            Location: <span style={infoStyle}>{location(member) || '[not set]'}</span>
          </p>}
          secondaryTextLines={2}
        />
      </MemberEdit>
    ]
    if (member.get('membership') !== 'Adult') actions.push(
      <Action
        key="up"
        innerDivStyle={{ paddingLeft: 60 }}
        leftIcon={<ThumbUp/>}
        onTouchTap={() => push(`/upgrade/${id}`)}
        primaryText="Upgrade membership"
        secondaryText=""
      />
    )
    if (showHugoActions && member.get('can_hugo_vote')) actions.push(
      <Action
        key="hv"
        innerDivStyle={{ paddingLeft: 60 }}
        leftIcon={<Rocket />}
        onTouchTap={() => push(`/hugo/${id}/vote`)}
        primaryText="Vote for the Hugo Awards"
      />
    )
    if (showHugoActions && member.get('can_hugo_nominate')) actions.push(
      <Action
        key="hn"
        innerDivStyle={{ paddingLeft: 60 }}
        leftIcon={<Rocket />}
        onTouchTap={() => push(`/hugo/${id}/nominate`)}
        primaryText="Nominate for the Hugo Awards"
      />
    )
    if (isWSFSMember(member)) actions.push(
      <Action
        key="ss"
        innerDivStyle={{ paddingLeft: 60 }}
        leftIcon={<LocationCity />}
        onTouchTap={() => push(`/pay/ss-token`)}
        primaryText="Buy a site selection token"
      />,
      <Action
        key="as"
        innerDivStyle={{ paddingLeft: 60 }}
        leftIcon={<Palette />}
        onTouchTap={ () => push(`/exhibition/${id}`) }
        primaryText="Register for the Art Show"
      />
    )
    return actions
  }

  get title() {
    const { member } = this.props
    const membership = member.get('membership', 'NonMember')
    if (membership !== 'NonMember') return `${membership} member #${member.get('member_number')}`
    const daypass = member.get('daypass')
    if (daypass) {
      const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        .filter((day, i) => member.getIn(['daypass_days', i]))
        .join('/')
      return `${daypass} day pass ${days}`
    }
    return member.get('can_hugo_nominate') ? 'Hugo nominator' : 'Non-member'
  }

  render() {
    const { member } = this.props
    if (!member) return null
    return <Card style={{ marginBottom: 18 }}>
      <CardHeader
        title={member.get('legal_name')}
        style={{ fontWeight: 600 }}
        subtitle={this.title}
      />
      <CardActions style={{ marginLeft: 8, paddingTop: 0 }}>
        <List style={{ paddingTop: 0 }}>
          {this.actions}
        </List>
      </CardActions>
    </Card>
  }
}

export default connect(null, {
  push
})(MemberCard)
