import { Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

import printBadge from '../printBadge'
import { CommonFields, PaperPubsFields } from './form'
import MemberLog from './MemberLog'
import NewInvoice from './NewInvoice'
import Upgrade from './Upgrade'

export const defaultMember = Map({
  legal_name: '',
  email: '',
  badge_name: '',
  badge_subtitle: '',
  public_first_name: '',
  public_last_name: '',
  country: '',
  state: '',
  city: ''
})

export const memberFields = [
  'membership', 'legal_name', 'email', 'badge_name', 'badge_subtitle',
  'public_first_name', 'public_last_name', 'country', 'state', 'city',
  'paper_pubs'
]

export const membershipTypes = [
  'NonMember', 'Exhibitor', 'Supporter', 'KidInTow', 'Child', 'Youth',
  'FirstWorldcon', 'Adult'
]

export const emptyPaperPubsMap = Map({ name: '', address: '', country: '' })

export const paperPubsIsValid = (pp) => (
  !pp || pp.get('name') && pp.get('address') && pp.get('country')
)

export const memberIsValid = (member) => (
  Map.isMap(member) &&
  member.get('legal_name', false) &&
  member.get('email', false) &&
  paperPubsIsValid(member.get('paper_pubs'))
)

class Member extends PureComponent {
  static propTypes = {
    api: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    locked: PropTypes.bool.isRequired,
    member: ImmutablePropTypes.mapContains({
      id: PropTypes.number,
      legal_name: PropTypes.string,
      email: PropTypes.string,
      badge_name: PropTypes.string,
      badge_subtitle: PropTypes.string,
      public_first_name: PropTypes.string,
      public_last_name: PropTypes.string,
      country: PropTypes.string,
      state: PropTypes.string,
      city: PropTypes.string,
      paper_pubs: ImmutablePropTypes.mapContains({
        name: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        country: PropTypes.string.isRequired
      })
    }),
    printer: PropTypes.string
  }

  state = {
    member: Map(),
    sent: false
  }

  componentWillReceiveProps ({ member }) {
    if (member && !member.equals(this.props.member)) {
      this.setState({
        member: defaultMember.merge(member),
        sent: false
      })
    }
  }

  get actions () {
    const { api, handleClose, locked, member, printer } = this.props
    const { sent } = this.state
    const hasChanges = this.changes.size > 0
    const email = member.get('email')
    const id = member.get('id')
    const legal_name = member.get('legal_name')
    const member_number = member.get('member_number')
    const membership = member.get('membership')
    const paper_pubs = member.get('paper_pubs')

    const actions = [
      <FlatButton key='close' label='Close' onTouchTap={handleClose} />,
      <FlatButton key='ok'
        disabled={sent || !hasChanges || !this.valid}
        label={sent ? 'Working...' : 'Apply'}
        onTouchTap={() => this.save().then(handleClose)}
      />
    ]

    if (!locked) {
      actions.unshift(
        <MemberLog key='log'
          getLog={() => api.GET(`people/${id}/log`)}
          id={id}
      >
          <FlatButton label='View log' style={{ float: 'left' }} />
        </MemberLog>,

        <Upgrade key='upgrade'
          membership={membership}
          paper_pubs={paper_pubs}
          name={`${legal_name} <${email}>`}
          upgrade={res => api.POST(`people/${id}/upgrade`, res)}
      >
          <FlatButton label='Upgrade' style={{ float: 'left' }} />
        </Upgrade>,

        <NewInvoice key='invoice'
          onSubmit={invoice => api.POST(`purchase/invoice`, {
            email,
            items: [invoice]
          })}
          person={member}
      >
          <FlatButton label='New invoice' style={{ float: 'left' }} />
        </NewInvoice>
    )
    }

    if (printer && member_number) {
      actions.unshift(
        <FlatButton
          disabled={sent || !this.valid}
          label={hasChanges ? 'Save & Print badge' : 'Print badge'}
          onTouchTap={() => {
            const [pu, pn] = printer.split('#')
            return printBadge(pu, pn, this.state.member)
            .catch(err => {
              console.error('Badge print failed!', err)
              window.alert('Badge print failed! ' + (err.message || err.statusText || err.status))
            })
            .then(() => hasChanges ? this.save() : null)
            .then(handleClose)
          }}
          style={{ float: 'left' }}
      />
    )
    }

    return actions
  }

  get changes () {
    const m0 = this.props.member
    return this.state.member.filter((value, key) => {
      const v0 = m0.get(key, '')
      return Map.isMap(value) ? !value.equals(v0) : value !== v0
    })
  }

  get valid () {
    return memberIsValid(this.state.member)
  }

  save () {
    const { api, member } = this.props
    this.setState({ sent: true })
    return api.POST(`people/${member.get('id')}`, this.changes.toJS())
      .catch(err => {
        console.error('Member save failed!', err)
        window.alert('Member save failed! ' + err.message)
      })
  }

  render () {
    const { handleClose, member } = this.props
    if (!member) return null
    const membership = member.get('membership', 'NonMember')
    const formProps = {
      getDefaultValue: path => member.getIn(path, ''),
      getValue: path => this.state.member.getIn(path, null),
      onChange: (path, value) => this.setState({ member: this.state.member.setIn(path, value) })
    }

    return <Dialog
      actions={this.actions}
      title={<div title={'ID: ' + member.get('id')}>
        <div style={{
          color: 'rgba(0, 0, 0, 0.3)',
          float: 'right',
          fontSize: 11,
          fontStyle: 'italic',
          lineHeight: 'normal',
          textAlign: 'right'
        }}>
          Last modified<br />
          { member.get('last_modified') }
        </div>
        {
          membership === 'NonMember' ? 'Non-member'
            : /^DP/.test(membership) ? membership.replace(/^DP/, 'Day pass:')
            : `Member #${member.get('member_number')} (${membership})`
        }
      </div>}
      open
      autoScrollBodyContent
      bodyClassName='memberDialog'
      onRequestClose={handleClose}
    >
      <CommonFields {...formProps} />
      <br />
      <PaperPubsFields {...formProps} />
    </Dialog>
  }
}

export default connect(
  ({ registration }) => ({
    locked: registration.get('locked') || false,
    printer: registration.get('printer')
  })
)(Member)
