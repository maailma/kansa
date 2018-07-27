import { List, Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'

import { Card, CardActions, CardText } from 'material-ui/Card'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'

import { setScene, showMessage } from '../../app/actions/app'
import { buyDaypass, getDaypassPrices, getPurchaseData } from '../../payments/actions'
import StripeCheckout from '../../payments/components/stripe-checkout'
import MemberForm from './MemberForm'

const DaypassTypeSelect = ({ daypassData, onChange, value }) => (
  <SelectField
    floatingLabelFixed
    floatingLabelText='Day pass type'
    fullWidth
    onChange={(ev, idx, value) => onChange(value)}
    value={value}
  >
    { daypassData && daypassData.get('types').entrySeq().map(([key, type]) => (
      <MenuItem
        key={key}
        value={type.get('key')}
        primaryText={type.get('label')}
      />
    )) }
  </SelectField>
)

class NewDaypassForm extends React.Component {
  static propTypes = {
    buyDaypass: PropTypes.func.isRequired,
    daypassData: ImmutablePropTypes.map,
    daypassPrices: ImmutablePropTypes.map,
    email: PropTypes.string,
    getDaypassPrices: PropTypes.func.isRequired,
    getPurchaseData: PropTypes.func.isRequired,
    params: PropTypes.shape({
      type: PropTypes.string
    }).isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    const { email, params: { type } } = this.props
    this.state = {
      person: Map({ email, membership: type }),
      sent: false,
      valid: false
    }
  }

  componentWillReceiveProps (nextProps) {
    const { email, params: { type } } = nextProps
    let { person } = this.state
    if (email !== this.props.email) person = person.set('email', email)
    if (type !== this.props.params.type) person = person.set('membership', type)
    if (!person.equals(this.state.person)) this.setState({ person })
  }

  componentDidMount () {
    const { daypassData, daypassPrices, getDaypassPrices, getPurchaseData, setScene } = this.props
    setScene({ title: 'New Day Pass', dockSidebar: false })
    if (!daypassData) getPurchaseData()
    if (!daypassPrices) getDaypassPrices()
  }

  onCheckout = (token) => {
    const { buyDaypass, push, showMessage } = this.props
    const { person } = this.state
    const amount = this.price
    const email = person.get('email')
    showMessage(`Charging ${email} EUR ${amount / 100} ...`)
    buyDaypass(person, amount, email, token, () => {
      showMessage('Charge completed; day pass purchased!')
      push('/')
    })
  }

  get dayData () {
    const { daypassData } = this.props
    return daypassData.get('shape')
      .filter(data => /^day\d+$/.test(data.get('key')))
      .map(data => ({ day: data.get('key'), label: data.get('label') }))
  }

  get description () {
    const { params: { type } } = this.props
    const { person } = this.state
    const ds = (this.dayData || List())
      .filter(({ day }) => person.get(day))
      .map(({ label }) => label.substr(0, 3))
      .join('/')
    return `${type} day pass ${ds}`
  }

  get price () {
    const { daypassPrices, params: { type } } = this.props
    const { person } = this.state
    return daypassPrices.get(type).reduce((sum, price, day) => (
      sum + (person.get(day) ? price : 0)
    ), 0)
  }

  render () {
    const { daypassData, daypassPrices, params: { type }, replace } = this.props
    const { person, sent, valid } = this.state
    if (!daypassData || !daypassPrices) return null
    const amount = this.price
    const paymentDisabled = !valid || amount <= 0

    return <Row>
      <Col
        xs={12}
        sm={10} smOffset={1}
        lg={8} lgOffset={2}
        style={{ paddingTop: 20 }}
      >
        <Card>
          <CardText>
            <Row>
              <Col xs={12}>
                <DaypassTypeSelect
                  daypassData={daypassData}
                  onChange={(type) => replace(`/${type.replace('-', '/')}`)}
                  value={`daypass-${type}`}
                />
              </Col>
            </Row>
            <Row style={{ paddingBottom: 20, paddingTop: 6 }}>
              <Col xs={0} sm={2} />
              {this.dayData.map(({ day, label }) => {
                const selected = person.get(day, false)
                return (
                  <Col xs={12} sm={4} key={day} style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <RaisedButton
                      fullWidth
                      label={`${label} (€${daypassPrices.getIn([type, day]) / 100})`}
                      onTouchTap={() => this.setState({ person: person.set(day, !selected) })}
                      primary={selected}
                    />
                  </Col>
                )
              })}
            </Row>
            <MemberForm
              lc='daypass'
              member={person}
              newMember
              onChange={(valid, person) => this.setState({ person, valid })}
              tabIndex={2}
            />
          </CardText>
          <CardActions style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', padding: 16 }}>
            <StripeCheckout
              amount={amount}
              currency='EUR'
              description={this.description}
              disabled={paymentDisabled}
              email={person.get('email')}
              onCheckout={this.onCheckout}
              onClose={() => this.setState({ sent: false })}
            >
              <RaisedButton
                label={sent ? 'Working...' : 'Pay by card'}
                disabled={paymentDisabled}
                onTouchTap={() => this.setState({ sent: true })}
                primary
                style={{ marginRight: 16 }}
                tabIndex={3}
              />
            </StripeCheckout>
            <div>
              {amount > 0 ? `Total: €${(amount / 100).toFixed(2)}` : ''}
            </div>
          </CardActions>
        </Card>
      </Col>
    </Row>
  }
}

export default connect(
  ({ purchase, user }, { params: { type } }) => ({
    email: user.get('email'),
    daypassData: purchase.getIn(['data', 'daypass']),
    daypassPrices: purchase.get('daypassPrices')
  }), {
    buyDaypass,
    getDaypassPrices,
    getPurchaseData,
    push,
    replace,
    setScene,
    showMessage
  }
)(NewDaypassForm)
