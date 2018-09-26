import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React, { Component, createRef } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { MessageProvider } from 'react-message-context'

import HookModules from '../../hook-modules'
import messages from '../messages'
import LocationEdit from './location-edit'
import NameEmailEdit from './name-email-edit'
import PublicNameEdit from './public-name-edit'
import PaperPubsEdit, { paperPubsIsValid } from './paper-pubs-edit'

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
    const baseFields = [
      <NameEmailEdit
        key="10-name"
        {...editProps}
        inputRef={this.focusRef}
        isNew={newDaypass || newMember}
      />,
      <PublicNameEdit key="20-public" {...editProps} />,
      <LocationEdit key="30-location" {...editProps} />,
      <PaperPubsEdit key="40-paperpubs" {...editProps} isNew={newMember} />
    ]
    return (
      <MessageProvider fallback="en" locale={locale} messages={messages}>
        <HookModules
          args={[editProps]}
          base={baseFields}
          hook="memberFormFields"
          member={member}
        >
          {fields => <form>{fields}</form>}
        </HookModules>
      </MessageProvider>
    )
  }
}
