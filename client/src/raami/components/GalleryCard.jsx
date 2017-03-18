import React from 'react';
import { connect } from 'react-redux'
const { Col, Row } = require('react-flexbox-grid');

import Checkbox from 'material-ui/Checkbox'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'

const labelStyle = {
  color: '#888',
  fontSize: 16
};

const GalleryCard = ({ artist: { auction, digital, legal, postage, print, waitlist }, onChange, onSave, style }) => {
  let total = auction * 20 + print * 10;
  if (digital) total += 20;
  if (postage > 0) total += parseInt(postage) + 20;

  return <Card style={style}>
    <CardHeader style={{ fontWeight: 600 }} title="Reserve Gallery Space"/>
    <CardText style={{ fontSize: 16 }}>
      <Row style={{ alignItems: 'center' }}>
        <Col xs={8}>
          <label style={labelStyle}>Auction gallery</label>
        </Col>
        <Col xs={3}>
          <TextField
            fullWidth={true}
            inputStyle={{ textAlign: 'right' }}
            min={0}
            name="auction"
            onChange={ev => onChange({ auction: Math.max(0, ev.target.value) })}
            type="number"
            value={auction}
          />
        </Col>
        <Col xs={1}>m</Col>
      </Row>
      <Row style={{ alignItems: 'center' }}>
        <Col xs={8}>
          <label style={labelStyle}>Printshop gallery</label>
        </Col>
        <Col xs={3}>
          <TextField
            fullWidth={true}
            inputStyle={{ textAlign: 'right' }}
            min={0}
            name="print"
            onChange={ev => onChange({ print: Math.max(0, ev.target.value) })}
            type="number"
            value={print}
          />
        </Col>
        <Col xs={1}>m</Col>
      </Row>
      <Row>
        <Col xs={11} style={{ margin: '8px 0' }}>
          <Checkbox
            label="Digital gallery (Max 20 works)"
            labelPosition="left"
            labelStyle={{ color: '#888', width: 'calc(100% - 48px)' }}
            onCheck={(ev, value) => onChange({ digital: value })}
            checked={digital}
          />
        </Col>
      </Row>
      <Row style={{ alignItems: 'center' }}>
        <Col xs={8}>
          <label style={labelStyle}>Estimated Return Postage (plus 20 € for handling)</label>
        </Col>
        <Col xs={3}>
          <TextField
            fullWidth={true}
            inputStyle={{ textAlign: 'right' }}
            min={0}
            name="postage"
            onChange={ev => onChange({ postage: Math.max(0, ev.target.value) })}
            type="number"
            value={postage}
          />
        </Col>
        <Col xs={1}>€</Col>
      </Row>

      <Checkbox
        checked={waitlist}
        label="If the art show is full then I would like to go on the waiting list."
        labelStyle={labelStyle}
        onCheck={(ev, value) => onChange({ waitlist: value })}
        style={{ marginTop: 20 }}
      />
    </CardText>

    <CardActions style={{ alignItems: 'center', display: 'flex', padding: 16 }}>
      <div style={{ flexGrow: 1 }}>
        Total estimated cost: {total} €
      </div>
      <RaisedButton
        disabled={!legal}
        label="Save"
        onClick={() => onSave(this.state)}
        primary={true}
        type="submit"
      />
    </CardActions>
  </Card>;
};

GalleryCard.propTypes = {
  artist: React.PropTypes.shape({
    auction: React.PropTypes.number,
    digital: React.PropTypes.boolean,
    legal: React.PropTypes.boolean,
    postage: React.PropTypes.number,
    print: React.PropTypes.number,
    waitlist: React.PropTypes.boolean,
  }).isRequired,
  onChange: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func.isRequired,
}

export default GalleryCard;
