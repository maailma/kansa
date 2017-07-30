import PropTypes from 'prop-types'
import React from 'react'
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

const GalleryCard = ({ artist: { auction, digital, legal, postage, print, waitlist, half }, onChange, onSave, style }) => {
  let total = auction * 30 + half * 15 + print * 0.5;
  if (digital) total += 20;
  if (postage > 0) total += parseInt(postage) + 20;
  return <Card style={style}>
    <CardHeader style={{ fontWeight: 600 }} title="Reserve Gallery Space"/>
    <CardText style={{ fontSize: 16 }}>
      <Row style={{ alignItems: 'center' }}>
        <Col xs={8}>          
          <label style={labelStyle}>Auction gallery wall panels</label>
        </Col>
        <Col xs={3}>
          <TextField
            fullWidth={true}
            inputStyle={{ textAlign: 'right' }}
            min={0}
            max={4}
            name="auction"
            onChange={ev => onChange({ auction: Math.max(0, ev.target.value) })}
            type="number"
            value={auction}
          />
        </Col>
        <Col xs={12}>
        <span style={{ fontSize:13 }} >       
        1 x 2.5 metres, of which 1 x 1.5 metres is optimally usable. Maximum of 4 per artist at 30 € each.
        </span>
        </Col>
        <Col xs={8}>
          <label style={labelStyle}>Auction gallery table halfs</label>
        </Col>
        <Col xs={3}>
          <TextField
            fullWidth={true}
            inputStyle={{ textAlign: 'right' }}
            min={0}
            max={8}
            name="half"
            onChange={ev => onChange({ half: Math.max(0, ev.target.value) })}
            type="number"
            value={half}
          />
        </Col>
          <Col xs={12}>
          <span style={{ fontSize:13 }} >       
          100cm x 70cm. Maximum of 8 half-tables per artist at 15 € each.
          </span>
        </Col>
      </Row>
      <Row style={{ alignItems: 'center' }}>
        <Col xs={8}>
          <label style={labelStyle}>Printshop gallery copy items</label>
        </Col>
        <Col xs={3}>
          <TextField
            fullWidth={true}
            inputStyle={{ textAlign: 'right' }}
            min={0}
            max={200}
            name="print"
            onChange={ev => onChange({ print: Math.max(0, ev.target.value) })}
            type="number"
            value={print}
          />
        </Col>
        <Col xs={1}>total</Col>
        <Col xs={12}>
                <span style={{ fontSize:13 }}>          
           0.50 € per item copy. Maximum of 200 individual items per artist.
           </span>
        </Col>
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
        onClick={() => onSave()}
        primary={true}
        type="submit"
      />
    </CardActions>
  </Card>;
};

GalleryCard.propTypes = {
  artist: PropTypes.shape({
    auction: PropTypes.number,
    digital: PropTypes.boolean,
    legal: PropTypes.boolean,
    postage: PropTypes.number,
    print: PropTypes.number,
    waitlist: PropTypes.boolean,
    half: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
}

export default GalleryCard;
