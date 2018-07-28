import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { Card, CardHeader, CardActions } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'
import Receipt from 'material-ui/svg-icons/action/receipt'
import ThumbUp from 'material-ui/svg-icons/action/thumb-up'
import ContentCreate from 'material-ui/svg-icons/content/create'
import Palette from 'material-ui/svg-icons/image/palette'
import LocationCity from 'material-ui/svg-icons/social/location-city'
import ImmutablePropTypes from 'react-immutable-proptypes'

import Rocket from '../../lib/rocket-icon'
import SlackIcon from '../../lib/slack-icon'
import SouvenirBook from '../../lib/souvenir-book'
import { requestSlackInvite } from '../actions'
import { isAttendingMember, isWSFSMember } from '../constants'
import MemberEdit from './MemberEdit'
import ShowBarcode from './show-barcode'

const badgeName = (member) => (
  member.get('badge_name') || member.get('preferred_name')
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
    {...props}
  />
)

class MemberCard extends React.Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    push: PropTypes.func.isRequired,
    requestSlackInvite: PropTypes.func.isRequired,
    showHugoActions: PropTypes.bool
  }

  get actions () {
    const { member, push, requestSlackInvite, showHugoActions } = this.props
    const id = member.get('id')
    const infoStyle = { color: 'rgba(0, 0, 0, 0.870588)' }
    const membership = member.get('membership')
    const actions = [
      <MemberEdit key='ed' member={member}>
        <Action
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<ContentCreate style={{ top: 12 }} />}
          primaryText='Edit personal information'
          secondaryText={<p>
            Badge name: <span style={infoStyle}>{badgeName(member)}</span><br />
            Public name: <span style={infoStyle}>{publicName(member) || '[not set]'}</span><br />
          </p>}
          secondaryTextLines={2}
        />
      </MemberEdit>
    ]
    if (membership !== 'Supporter' && (membership !== 'NonMember' || member.get('daypass'))) actions.push(
      <ShowBarcode key='bc' memberId={id}>
        <Action
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<Receipt />}
          primaryText='Show registration barcode'
          secondaryText=''
        />
      </ShowBarcode>
    )
    if (membership !== 'Adult' || !member.get('paper_pubs')) actions.push(
      <Action
        key='up'
        innerDivStyle={{ paddingLeft: 60 }}
        leftIcon={<ThumbUp style={{ top: 12 }}/>}
        onTouchTap={() => push(`/upgrade/${id}`)}
        primaryText='Upgrade membership'
        secondaryText='and/or add paper publications'
      />
    )
    if (showHugoActions && member.get('hugo_voter')) {
      actions.push(
        <Action
          key='hv'
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<Rocket />}
          onTouchTap={() => push(`/hugo/${id}/vote`)}
          primaryText='Vote for the Hugo Awards'
        />
      )
    }
    if (showHugoActions && member.get('hugo_nominator')) {
      actions.push(
        <Action
          key='hn'
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<Rocket />}
          onTouchTap={() => push(`/hugo/${id}/nominate`)}
          primaryText='Nominate for the Hugo Awards'
        />
      )
    }
    if (isWSFSMember(member)) {
      actions.push(
        <Action
          key='sb'
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<SouvenirBook />}
          onTouchTap={() => {
            window.location = '/member-files/souvenir-book.pdf'
          }}
          primaryText='Open souvenir book (PDF)'
        />
      )
    }
    return actions
  }

  get title () {
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
    return member.get('hugo_nominator') ? 'Hugo nominator' : 'Non-member'
  }

  render () {
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
  push,
  requestSlackInvite
})(MemberCard)
