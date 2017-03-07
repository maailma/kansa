import React from 'react';
import { connect } from 'react-redux'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import { List, ListItem } from 'material-ui/List'
import ContentAdd from 'material-ui/svg-icons/content/add-circle'

const ArtworkAdderCard = ({ onAdd, style }) => {
  return <Card style={style}>
    <CardHeader style={{ fontWeight: 600 }} title="Submit New Artwork"/>
    <CardActions style={{ marginLeft: 8, paddingTop: 0 }}>
      <List style={{ paddingTop: 0 }}>
        <ListItem
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<ContentAdd/>}
          onTouchTap={onAdd}
          primaryText="Add new artwork"
          secondaryText="You may edit works later"
        />
      </List>
    </CardActions>
  </Card>;
};

ArtworkAdderCard.propTypes = {
  onAdd: React.PropTypes.func.isRequired,
}

export default ArtworkAdderCard;
