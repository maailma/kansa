import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { List, ListItem } from 'material-ui/List'
import Receipt from 'material-ui/svg-icons/action/receipt'
import ThumbUp from 'material-ui/svg-icons/action/thumb-up'
import ContentCreate from 'material-ui/svg-icons/content/create'
import LocationCity from 'material-ui/svg-icons/social/location-city'

import { ConfigConsumer } from '../../lib/config-context'
import Rocket from '../../lib/rocket-icon'
import SlackIcon from '../../lib/slack-icon'
import SouvenirBook from '../../lib/souvenir-book'
import { requestSlackInvite } from '../actions'
import * as MemberPropTypes from '../proptypes'
import MemberEdit from './MemberEdit'
import ShowBarcode from './show-barcode'

const Action = props => (
  <ListItem innerDivStyle={{ paddingLeft: 60 }} {...props} />
)

let HugoAction = ({
  attrName,
  getPath,
  member,
  membershipTypes,
  people,
  primaryText,
  push
}) => {
  const attr = membershipTypes && membershipTypes[member.get('membership')]
  if (!attr || !attr[attrName]) return null
  return people.size > 1 &&
    people.some(p => {
      if (p === member) return false
      const pm = membershipTypes[p.get('membership')]
      return pm && pm[attrName]
    }) ? null : (
    <Action
      leftIcon={<Rocket />}
      onClick={() => push(getPath(member.get('id')))}
      primaryText={primaryText}
    />
  )
}
HugoAction = connect(
  ({ user }) => ({ people: user.get('people') }),
  { push }
)(HugoAction)

const HugoNominateAction = props => (
  <HugoAction
    attrName="hugo_nominator"
    getPath={id => `/hugo/nominate/${id}`}
    primaryText="Nominate for the Hugo Awards"
    {...props}
  />
)

const HugoVoteAction = props => (
  <HugoAction
    attrName="wsfs_member"
    getPath={id => `/hugo/vote/${id}`}
    primaryText="Vote for the Hugo Awards"
    {...props}
  />
)

const EditAction = ({ member }) => {
  const infoStyle = { color: 'rgba(0, 0, 0, 0.870588)' }
  const badgeName = member.get('badge_name') || member.get('preferred_name')
  const publicName = [
    member.get('public_first_name'),
    member.get('public_last_name')
  ]
    .filter(n => n)
    .join(' ')
    .trim()
  return (
    <MemberEdit member={member}>
      <Action
        leftIcon={<ContentCreate style={{ top: 12 }} />}
        primaryText="Edit personal information"
        secondaryText={
          <p>
            Badge name: <span style={infoStyle}>{badgeName}</span>
            <br />
            Public name:{' '}
            <span style={infoStyle}>{publicName || '[not set]'}</span>
            <br />
          </p>
        }
        secondaryTextLines={2}
      />
    </MemberEdit>
  )
}

const BarcodeAction = ({ attr, member }) => {
  return attr && (attr.badge || member.get('daypass')) ? (
    <ShowBarcode memberId={member.get('id')}>
      <Action leftIcon={<Receipt />} primaryText="Show registration barcode" />
    </ShowBarcode>
  ) : null
}

let UpgradeAction = ({ member, paidPaperPubs, purchaseData, push }) => {
  const mpt = purchaseData && purchaseData.getIn(['new_member', 'types'])
  if (!mpt) return null
  const prevAmount = mpt.getIn([member.get('membership'), 'amount'])
  const upgrade = mpt.some(t => t.get('amount') > prevAmount)
  const addPP = paidPaperPubs && !member.get('paper_pubs')
  return upgrade || addPP ? (
    <Action
      leftIcon={<ThumbUp style={upgrade && addPP ? { top: 12 } : null} />}
      onClick={() => push(`/upgrade/${member.get('id')}`)}
      primaryText={upgrade ? 'Upgrade membership' : 'Add paper publications'}
      secondaryText={upgrade && addPP ? 'and/or add paper publications' : ''}
    />
  ) : null
}
UpgradeAction = connect(
  ({ purchase }) => ({ purchaseData: purchase.get('data') }),
  { push }
)(UpgradeAction)

let SiteSelectionTokenAction = ({ attr, push }) =>
  attr && attr.wsfs_member ? (
    <Action
      leftIcon={<LocationCity />}
      onClick={() => push(`/pay/ss-token`)}
      primaryText="Buy a site selection token"
    />
  ) : null
SiteSelectionTokenAction = connect(
  null,
  { push }
)(SiteSelectionTokenAction)

let SlackInviteAction = ({ attr, requestSlackInvite }) =>
  attr && attr.member ? (
    <Action
      leftIcon={<SlackIcon />}
      onClick={requestSlackInvite}
      primaryText="Request Slack invite"
    />
  ) : null
SlackInviteAction = connect(
  null,
  { requestSlackInvite }
)(SlackInviteAction)

const SouvenirBookAction = ({ attr }) =>
  attr && attr.wsfs_member ? (
    <Action
      leftIcon={<SouvenirBook />}
      onClick={() => {
        window.location = '/member-files/souvenir-book.pdf'
      }}
      primaryText="Open souvenir book (PDF)"
    />
  ) : null

const MemberActions = ({ member }) => (
  <ConfigConsumer>
    {({ membershipTypes, paid_paper_pubs }) => {
      const attr = membershipTypes && membershipTypes[member.get('membership')]
      return (
        <List style={{ paddingTop: 0 }}>
          <EditAction member={member} />
          <UpgradeAction member={member} paidPaperPubs={paid_paper_pubs} />
          <BarcodeAction attr={attr} member={member} />
          <HugoNominateAction
            member={member}
            membershipTypes={membershipTypes}
          />
          <HugoVoteAction member={member} membershipTypes={membershipTypes} />
          <SiteSelectionTokenAction attr={attr} />
          <SlackInviteAction attr={attr} />
          <SouvenirBookAction attr={attr} />
        </List>
      )
    }}
  </ConfigConsumer>
)

MemberActions.propTypes = {
  member: MemberPropTypes.person.isRequired
}

export default MemberActions
