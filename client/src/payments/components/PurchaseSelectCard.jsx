import { List as ImmutableList } from 'immutable'
import React from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'

const PurchaseSelectCard = ({ data, label, onSelect, title }) => {
  const items = data.get('types').entrySeq().map(([key, typeData]) => {
    const amount = typeData.get('amount');
    const label = typeData.get('label');
    const primary = label + (amount > 0 ? ` (€${amount / 100})` : '');
    return <ListItem
      key={key}
      onTouchTap={() => onSelect(key)}
      primaryText={primary}
    />;
  });
  return <Card
    style={{ marginBottom: 18 }}
  >
    {title && <CardHeader
      className="action-head"
      style={{ fontWeight: 600 }}
      title={title}
    />}
    <CardActions style={{ paddingLeft: 16 }}>
      <List>{ items.toJS() }</List>
    </CardActions>
  </Card>;
};

export default PurchaseSelectCard;
