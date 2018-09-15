import React from 'react'
import Action from '@kansa/client-lib/action'
import api from '@kansa/client-lib/api'
import SlackIcon from './slack-icon'

const SlackAction = ({ org }) => (
  <Action
    leftIcon={<SlackIcon />}
    onClick={() =>
      api
        .POST(`slack/invite`)
        .then(({ email }) => `Slack invite sent to ${JSON.stringify(email)}.`)
    }
    primaryText="Request Slack invite"
    secondaryText={`Join us at ${org}.slack.com`}
  />
)

export default function slackModule(config) {
  const { org, require_membership } = config.modules.slack
  const actions = ({ member }) =>
    require_membership && !member ? null : (
      <SlackAction key="slack" org={org} order={90} />
    )
  return { actions }
}
