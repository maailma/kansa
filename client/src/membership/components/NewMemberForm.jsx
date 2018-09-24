import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
import { Card, CardActions, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { Col, Row } from 'react-flexbox-grid'

import { setScene, showMessage } from '../../app/actions/app'
import getMemberPrice from '../../lib/get-member-price'
import { buyMembership, getPurchaseData } from '../../payments/actions'
import StripeCheckout from '../../payments/components/stripe-checkout'
import * as PaymentPropTypes from '../../payments/proptypes'
import MemberForm from '../form'
import MembershipSelect from './membership-select'

class NewMemberForm extends React.Component {
  static propTypes = {
    buyMembership: PropTypes.func.isRequired,
    data: PaymentPropTypes.data,
    email: PropTypes.string,
    getPurchaseData: PropTypes.func.isRequired,
    params: PropTypes.shape({
      membership: PropTypes.string
    }).isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    const {
      email,
      params: { membership }
    } = props
    this.state = {
      member: Map({ email, membership }),
      sent: false,
      valid: false
    }
  }

  componentDidMount() {
    const { data, getPurchaseData, setScene } = this.props
    if (!data) getPurchaseData()
    setScene({ title: 'New Membership', dockSidebar: false })
  }

  componentWillReceiveProps(nextProps) {
    const {
      email,
      params: { membership }
    } = nextProps
    let { member } = this.state
    if (email !== this.props.email) member = member.set('email', email)
    if (membership !== this.props.params.membership)
      member = member.set('membership', membership)
    if (!member.equals(this.state.member)) this.setState({ member })
  }

  onCheckout = token => {
    const { buyMembership, push, showMessage } = this.props
    const { member } = this.state
    const amount = this.price
    const email = member.get('email')
    showMessage(`Charging ${email} EUR ${amount / 100} ...`)
    buyMembership(member, amount, email, token, () => {
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

  get description() {
    const { data } = this.props
    const { member } = this.state
    const type = member.get('membership')
    const typeLabel = data && data.getIn(['new_member', 'types', type, 'label'])
    let desc = `New ${typeLabel || type} member`
    if (member.get('paper_pubs'))
      desc += ' + ' + data.getIn(['paper_pubs', 'label'])
    return desc
  }

  get price() {
    const { data } = this.props
    const { member } = this.state
    return getMemberPrice(
      data,
      null,
      member.get('membership'),
      member.get('paper_pubs')
    )
  }

  render() {
    const { data, replace } = this.props
    const { member, sent, valid } = this.state
    const amount = this.price

    return (
      <Row>
        <Col
          xs={12}
          sm={10}
          smOffset={1}
          lg={8}
          lgOffset={2}
          style={{ paddingTop: 20 }}
        >
          <Card>
            <CardText>
              <Row>
                <Col xs={12}>
                  <MembershipSelect
                    data={data}
                    onChange={value => replace(`/new/${value}`)}
                    value={member.get('membership')}
                  />
                </Col>
              </Row>
              <MemberForm
                locale="en"
                member={member}
                newMember
                onChange={(valid, member) => this.setState({ member, valid })}
                tabIndex={2}
              />
            </CardText>
            <CardActions
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: 16,
                paddingBottom: 16
              }}
            >
              <div
                style={{
                  color: 'rgba(0, 0, 0, 0.5)',
                  paddingTop: 8,
                  paddingRight: 16
                }}
              >
                {amount > 0 ? `Total: €${amount / 100}` : ''}
              </div>
              {amount > 0 ? (
                <StripeCheckout
                  amount={amount}
                  currency="EUR"
                  description={this.description}
                  disabled={!valid}
                  email={member.get('email')}
                  onCheckout={this.onCheckout}
                  onClose={() => this.setState({ sent: false })}
                >
                  <FlatButton
                    label={sent ? 'Working...' : 'Pay by card'}
                    disabled={!valid}
                    onClick={() => this.setState({ sent: true })}
                    style={{ flexShrink: 0 }}
                    tabIndex={3}
                  />
                </StripeCheckout>
              ) : (
                <FlatButton
                  label="Sign up"
                  disabled={!valid || amount < 0}
                  onClick={this.onSignup}
                  style={{ flexShrink: 0 }}
                  tabIndex={3}
                />
              )}
            </CardActions>
          </Card>
        </Col>
      </Row>
    )
  }
}

export default connect(
  ({ purchase, user }) => ({
    data: purchase.get('data'),
    email: user.get('email')
  }),
  {
    buyMembership,
    getPurchaseData,
    push,
    replace,
    setScene,
    showMessage
  }
)(NewMemberForm)
