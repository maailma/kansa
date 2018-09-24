import ContentCreate from 'material-ui/svg-icons/content/create'
import React, { Fragment } from 'react'
import Action from '../../lib/action'

const memberEditSummaryLines = (badge, member) => {
  const lines = []
  if (badge) {
    const badgeName = member.get('badge_name') || member.get('preferred_name')
    lines.push({ dt: 'Badge name: ', dd: badgeName, key: 'badge' })
  }
  const pfn = member.get('public_first_name') || ''
  const pln = member.get('public_last_name') || ''
  const publicName = `${pfn} ${pln}`.trim()
  if (publicName)
    lines.push({ dt: 'Public name: ', dd: publicName, key: 'public' })
  else lines.push({ dt: 'No public name', key: 'public' })
  return lines
}

const MemberEditActionButton = ({ badge, member, onClick }) => {
  const infoStyle = { color: 'rgba(0, 0, 0, 0.870588)' }
  const lines = memberEditSummaryLines(badge, member)
  const secondaryText = (
    <p>
      {lines.map(({ dt, dd, key }) => (
        <Fragment key={key}>
          {dt}
          {dd && <span style={infoStyle}>{dd}</span>}
          <br />
        </Fragment>
      ))}
    </p>
  )
  return (
    <Action
      leftIcon={<ContentCreate style={{ top: 12 }} />}
      onClick={onClick}
      primaryText="Edit personal information"
      secondaryText={secondaryText}
      secondaryTextLines={lines.length}
    />
  )
}

export default MemberEditActionButton
