import React from 'react'
const ImmutablePropTypes = require('react-immutable-proptypes');

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'

const PurchaseItemCard = ({ purchase }) => {
  return <Card
    style={{ marginBottom: 24 }}
  >
    <CardText>
      <pre>{JSON.stringify(purchase.toJS(), null, '  ')}</pre>
    </CardText>
  </Card>;
};

export default PurchaseItemCard;
