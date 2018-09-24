import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { List, ListItem } from 'material-ui/List'
import ThumbUp from 'material-ui/svg-icons/action/thumb-up'
import LocationCity from 'material-ui/svg-icons/social/location-city'

import { ModuleConsumer } from '../../context'
import { ConfigConsumer } from '../../lib/config-context'
import Rocket from '../../lib/rocket-icon'
import SouvenirBook from '../../lib/souvenir-book'
import * as MemberPropTypes from '../proptypes'
import MemberEditAction from './member-edit-action'

const Action = props => (
  <ListItem innerDivStyle={{ paddingLeft: 60 }} {...props} />
)

let HugoAction = ({
  attrName,
  getMemberAttr,
  getPath,
  member,
  people,
  primaryText,
  push
}) => {
  if (!getMemberAttr(member)[attrName]) return null
  return people.size > 1 &&
    people.some(p => p !== member && getMemberAttr(p)[attrName]) ? null : (
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

let UpgradeAction = ({ member, paidPaperPubs, purchaseData, push }) => {
  const mpt = purchaseData && purchaseData.getIn(['new_member', 'types'])
  if (!mpt) return null
  const prevAmount = mpt.getIn([member.get('membership'), 'amount']) || 0
  const upgrade = mpt.some(t => t.get('amount') > prevAmount)
  const addPP = paidPaperPubs && !member.get('paper_pubs')
  if (!upgrade && !addPP) return null
  const primaryText = upgrade ? 'Upgrade membership' : 'Add paper publications'
  const secondaryText = upgrade && addPP ? 'and/or add paper publications' : ''
  return (
    <Action
      leftIcon={<ThumbUp style={upgrade && addPP ? { top: 12 } : null} />}
      onClick={() => push(`/upgrade/${member.get('id')}`)}
      primaryText={primaryText}
      secondaryText={secondaryText}
    />
  )
}
UpgradeAction = connect(
  ({ purchase }) => ({ purchaseData: purchase.get('data') }),
  { push }
)(UpgradeAction)

let SiteSelectionTokenAction = ({ attr, push }) =>
  attr.wsfs_member ? (
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

const SouvenirBookAction = ({ attr }) =>
  attr.wsfs_member ? (
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
    {({ getMemberAttr, paid_paper_pubs }) => (
      <ModuleConsumer>
        {modules => {
          const attr = getMemberAttr(member)
          const actions = modules.reduce(
            (actions, mod) =>
              mod.actions ? actions.concat(mod.actions(attr, member)) : actions,
            [
              <MemberEditAction key="10-edit" member={member} />,
              <UpgradeAction
                key="20-upgrade"
                member={member}
                paidPaperPubs={paid_paper_pubs}
              />,
              <HugoNominateAction
                key="30-hugo-nom"
                getMemberAttr={getMemberAttr}
                member={member}
              />,
              <HugoVoteAction
                key="30-hugo-vote"
                getMemberAttr={getMemberAttr}
                member={member}
              />,
              <SiteSelectionTokenAction key="40-siteselect" attr={attr} />,
              <SouvenirBookAction key="50-souvenir-book" attr={attr} />
            ]
          )
          actions.sort((a, b) => ((a && a.key) < (b && b.key) ? -1 : 1))
          return <List style={{ paddingTop: 0 }}>{actions}</List>
        }}
      </ModuleConsumer>
    )}
  </ConfigConsumer>
)

MemberActions.propTypes = {
  member: MemberPropTypes.person.isRequired
}

export default MemberActions