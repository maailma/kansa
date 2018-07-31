import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'
import LoungeIcon from 'material-ui/svg-icons/editor/border-color'
import BenchIcon from 'material-ui/svg-icons/content/weekend'
import TokenIcon from 'material-ui/svg-icons/social/location-city'
import React from 'react'

const icon = (key) => {
  switch (key) {
    case 'bench': return <BenchIcon />
    case 'lounge': return <LoungeIcon />
    case 'ss-token': return <TokenIcon />
    default: return null
  }
}

const SelectNewPaymentCard = ({ data, onSelect, title }) => {
  const description = data.get('description')
  const items = data.get('types').entrySeq().map(([key, typeData]) => {
    const amount = typeData.get('amount')
    const label = typeData.get('label')
    const primary = label + (amount > 0 ? ` (€${amount / 100})` : '')
    return <ListItem
      key={key}
      leftIcon={icon(key)}
      onClick={() => onSelect(key)}
      primaryText={primary}
    />
  })
  return <Card
    style={{ marginBottom: 18 }}
  >
    {title && <CardHeader
      className='action-head'
      style={{ fontWeight: 600 }}
      textStyle={{ paddingRight: 0 }}
      title={title}
    />}
    {description && <CardText
      className='html-container'
      dangerouslySetInnerHTML={{ __html: description }}
    />}
    <CardActions style={{ paddingLeft: 16 }}>
      <List>{ items.toJS() }</List>
    </CardActions>
  </Card>
}

export default SelectNewPaymentCard
