import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider';
import { List, ListItem, makeSelectable } from 'material-ui/List'
import EventSeat from 'material-ui/svg-icons/action/event-seat'
import DirectionsRun from 'material-ui/svg-icons/maps/directions-run'
import DirectionsWalk from 'material-ui/svg-icons/maps/directions-walk'
import SmilingFace from 'material-ui/svg-icons/social/mood'

import { setScene } from '../../app/actions/app'
import messages from '../messages'
import { getPrices } from '../../payments/actions'

const SelectableList = makeSelectable(List);

class TekMemberTypeList extends React.Component {
  static propTypes = {
    onSelectType: PropTypes.func.isRequired,
    prices: ImmutablePropTypes.map,
    selectedType: PropTypes.string,
    style: PropTypes.object
  }

  getAmount(type) {
    const { prices } = this.props
    if (!prices) return -1
    const fullAmount = prices.getIn(['memberships', type, 'amount']) || 0
    const discount = prices.getIn(['discounts', `TEK-${type}`, 'amount']) || 0
    return fullAmount - discount
  }

  render() {
    const { onSelectType, selectedType, style } = this.props;
    return (
      <SelectableList
        onChange={(ev, type) => onSelectType(type)}
        style={style}
        value={selectedType}
      >
        <ListItem
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<DirectionsWalk/>}
          primaryText={`${messages.fi.Adult()} (${this.getAmount('Adult')/100}€)`}
          secondaryText="TEKin jäsen"
          value="Adult"
        />
        <ListItem
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<DirectionsRun/>}
          primaryText={`${messages.fi.Youth()} (${this.getAmount('Youth')/100}€)`}
          secondaryText="TEKin jäsen, joka on syntynyt 10.8.1991 tai sen jälkeen"
          value="Youth"
        />
        <ListItem
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<SmilingFace/>}
          primaryText={`${messages.fi.Child()} (${this.getAmount('Child')/100}€)`}
          secondaryText="TEKin jäsenen lapsi, joka on syntynyt 10.8.2001 tai sen jälkeen. Alle 5-vuotiaat lapset pääsevät vanhempien seurassa ilmaiseksi."
          value="Child"
        />
        <Divider style={{ marginTop: 8, marginBottom: 8, marginLeft: 60 }} />
        <ListItem
          innerDivStyle={{ paddingLeft: 60 }}
          leftIcon={<EventSeat/>}
          primaryText={`${messages.fi.Supporter()} (${this.getAmount('Supporter')/100}€)`}
          secondaryText="Kaikki jäsenedut poislukien varsinaiseen tapahtumaan osallistuminen"
          value="Supporter"
        />
      </SelectableList>
    )
  }
}

class TekMemberIndex extends React.Component {
  static propTypes = {
    getPrices: React.PropTypes.func.isRequired,
    prices: ImmutablePropTypes.map,
    push: React.PropTypes.func.isRequired,
    setScene: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    const { getPrices, prices } = this.props
    if (!prices) getPrices()
  }

  componentDidMount() {
    this.props.setScene({ title: 'TEK-jäsenhinnat', dockSidebar: false })
  }

  onSelectType = (type) => this.props.push(`/tek/${type}`)

  render() {
    const { prices, push } = this.props;
    return <Row>
      <Col
        xs={12}
        sm={10} smOffset={1}
        md={8} mdOffset={2}
        lg={6} lgOffset={3}
      >
        <Card>
          <CardHeader
            className="action-head"
            textStyle={{ paddingRight: 0 }}
            title="Worldcon 75 tapahtuman jäsenhinnat TEKin jäsenille"
            style={{ fontWeight: 600, marginBottom: 16 }}
          />
          <CardText style={{ paddingTop: 0 }}>
            <p>Worldcon 75 tarjoaa tapahtumaan alennettuja hintoja TEKin jäsenille.</p>
            <p>Täysjäsenyys sisältää mm. pääsyn tapahtumaan kaikkina tapahtuman päivinä ja oikeuden äänestää Hugo-äänestyksessä. Lisätietoa jäsenyyksien eroista löytyy tapahtuman sivuilta osoitteesta <a href="http://worldcon.fi/">worldcon.fi</a></p>
          </CardText>
          <CardActions style={{ marginLeft: 8, paddingTop: 0 }}>
            <TekMemberTypeList
              onSelectType={this.onSelectType}
              prices={prices}
              style={{ paddingTop: 0 }}
            />
          </CardActions>
        </Card>
      </Col>
    </Row>
  }
}

export default connect(
  ({ purchase }) => ({
    prices: purchase.get('prices')
  }), {
    getPrices,
    push,
    setScene,
  }
)(TekMemberIndex)
