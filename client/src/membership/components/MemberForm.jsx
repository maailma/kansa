import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React, { Component, createRef } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { MessageProvider } from 'react-message-context'

import * as PaymentPropTypes from '../../payments/proptypes'
import BadgeEdit from '../form/badge-edit'
import LocationEdit from '../form/location-edit'
import NameEmailEdit from '../form/name-email-edit'
import PublicNameEdit from '../form/public-name-edit'
import PaperPubsEdit, { paperPubsIsValid } from '../form/paper-pubs-edit'
import messages from '../messages'

export default class MemberForm extends Component {
  static propTypes = {
    isAdmin: PropTypes.bool,
    locale: PropTypes.string,
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    newDaypass: PropTypes.bool,
    newMember: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    shopData: PaymentPropTypes.data,
    tabIndex: PropTypes.number
  }

  static defaultProps = {
    locale: 'en'
  }

  static isValid(member) {
    return (
      Map.isMap(member) &&
      member.get('legal_name', false) &&
      member.get('email', false) &&
      paperPubsIsValid(member.get('paper_pubs'))
    )
  }

  constructor(props) {
    super(props)
    this.focusRef = createRef()
    this.state = {
      member: props.member || Map()
    }
  }

  componentDidMount() {
    this.focusRef.current.focus()
  }

  componentWillReceiveProps({ member, newDaypass, newMember, onChange }) {
    if (!member) {
      this.setState({ member: Map() })
    } else if (!member.equals(this.props.member)) {
      this.setState({ member }, () => {
        const valid = MemberForm.isValid(member)
        const changes = newDaypass || newMember ? member.filter(Boolean) : {}
        onChange(valid, changes)
      })
    }
  }

  handleChange = member => {
    this.setState({ member }, () => {
      const { member: prev, newDaypass, newMember, onChange } = this.props
      const valid = MemberForm.isValid(member)
      const changes = member.filter(
        newDaypass || newMember || !prev
          ? Boolean
          : (value, key) => {
              let v0 = prev.get(key)
              if (typeof value === 'string' && !v0) v0 = ''
              return Map.isMap(value) ? !value.equals(v0) : value !== v0
            }
      )
      onChange(valid, changes)
    })
  }

  render() {
    const {
      isAdmin,
      locale,
      member: prevMember,
      newDaypass,
      newMember,
      shopData,
      tabIndex
    } = this.props
    const { member } = this.state
    const editProps = {
      isAdmin,
      member,
      onChange: this.handleChange,
      prevMember,
      tabIndex
    }
    return (
      <MessageProvider fallback="en" locale={locale} messages={messages}>
        <form>
          <NameEmailEdit
            {...editProps}
            inputRef={this.focusRef}
            isNew={newDaypass || newMember}
          />
          <BadgeEdit {...editProps} />
          <PublicNameEdit {...editProps} />
          <LocationEdit {...editProps} />
          <PaperPubsEdit {...editProps} isNew={newMember} shopData={shopData} />
        </form>
      </MessageProvider>
    )
  }
}
