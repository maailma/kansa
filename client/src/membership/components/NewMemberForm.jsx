import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
import { Card, CardActions, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'

import { setScene, showMessage } from '../../app/actions/app'
import { buyMembership, getPrices } from '../../payments/actions'
import StripeCheckout from '../../payments/components/stripe-checkout'
import { MembershipSelect } from './form-components'
import MemberForm from './MemberForm'

class NewMemberForm extends React.Component {
  static propTypes = {
    buyMembership: PropTypes.func.isRequired,
    email: PropTypes.string,
    getPrices: PropTypes.func.isRequired,
    prices: ImmutablePropTypes.map,
    params: PropTypes.shape({
      membership: PropTypes.string
    }).isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    const { email, getPrices, params: { membership }, prices, replace } = this.props
    if (membership !== 'Supporter') replace('/')
    this.state = {
      member: Map({ email, membership }),
      sent: false,
      valid: false
    }
    if (!prices) getPrices()
  }

  componentWillReceiveProps (nextProps) {
    const { email, params: { membership }, replace } = nextProps
    let { member } = this.state
    if (email !== this.props.email) member = member.set('email', email)
    if (membership !== 'Supporter') replace('/')
    if (!member.equals(this.state.member)) this.setState({ member })
  }

  componentDidMount () {
    this.props.setScene({ title: 'New Membership', dockSidebar: false })
  }

  onCheckout = (token) => {
    const { buyMembership, push, showMessage } = this.props
    const { member } = this.state
    const email = member.get('email')
    showMessage(`Charging ${email} EUR ${this.price / 100} ...`)
    buyMembership(member, this.price, email, token, () => {
      showMessage('Charge completed; new member registered!')
      push('/')
    })
  }

  onSignup = () => {
    const { buyMembership, push, showMessage } = this.props
    const { member } = this.state
    showMessage('Signing up...')
    buyMembership(member, 0, member.get('email'), null, () => {
      showMessage('Signup completed; new member registered!')
      push('/')
    })
  }

  get description () {
    const { prices } = this.props
    const { member } = this.state
    const msDesc = prices && prices.getIn(['memberships', member.get('membership'), 'description'])
    const parts = [`New ${msDesc} member`]
    if (member.get('paper_pubs')) parts.push(prices.getIn(['PaperPubs', 'description']))
    return parts.join(' + ')
  }

  get price () {
    const { prices } = this.props
    if (!prices) return 0
    const { member } = this.state
    const msAmount = prices.getIn(['memberships', member.get('membership'), 'amount']) || 0
    const ppAmount = member.get('paper_pubs') && prices.getIn(['PaperPubs', 'amount']) || 0
    return msAmount + ppAmount
  }

  render () {
    const { prices, replace } = this.props
    const { member, sent, valid } = this.state
    const amount = this.price

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
                <MembershipSelect
                  getValue={path => member.getIn(path) || ''}
                  onChange={(path, value) => replace(`/new/${value}`)}
                  prices={prices}
                />
              </Col>
            </Row>
            <MemberForm
              member={member}
              newMember
              onChange={(valid, member) => this.setState({ member, valid })}
              prices={prices}
              tabIndex={2}
            />
          </CardText>
          <CardActions style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 16, paddingBottom: 16 }}>
            <div style={{ color: 'rgba(0, 0, 0, 0.5)', paddingTop: 8, paddingRight: 16 }}>
              {amount > 0 ? `Total: €${amount / 100}` : ''}
            </div>
            {amount > 0 ? (
              <StripeCheckout
                amount={amount}
                currency='EUR'
                description={this.description}
                disabled={!valid}
                email={member.get('email')}
                onCheckout={this.onCheckout}
                onClose={() => this.setState({ sent: false })}
              >
                <FlatButton
                  label={sent ? 'Working...' : 'Pay by card'}
                  disabled={!valid}
                  onTouchTap={() => this.setState({ sent: true })}
                  style={{ flexShrink: 0 }}
                  tabIndex={3}
                />
              </StripeCheckout>
            ) : (
              <FlatButton
                label='Sign up'
                disabled={!valid || amount < 0}
                onTouchTap={this.onSignup}
                style={{ flexShrink: 0 }}
                tabIndex={3}
              />
            )}
          </CardActions>
        </Card>
      </Col>
    </Row>
  }
}

export default connect(
  ({ purchase, user }) => ({
    email: user.get('email'),
    prices: purchase.get('prices')
  }), {
    buyMembership,
    getPrices,
    push,
    replace,
    setScene,
    showMessage
  }
)(NewMemberForm)
