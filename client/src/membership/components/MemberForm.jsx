import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import * as PaymentPropTypes from '../../payments/proptypes'
import BadgeEdit from '../form/badge-edit'
import LocationEdit from '../form/location-edit'
import NameEmailEdit from '../form/name-email-edit'
import PublicNameEdit from '../form/public-name-edit'
import PaperPubs, { paperPubsIsValid } from './paper-pubs'

export default class MemberForm extends Component {
  static propTypes = {
    data: PaymentPropTypes.data,
    isAdmin: PropTypes.bool,
    lc: PropTypes.string,
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    newDaypass: PropTypes.bool,
    newMember: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    tabIndex: PropTypes.number
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
    this.state = {
      member: props.member || Map()
    }
  }

  componentDidMount() {
    this.focusRef && this.focusRef.focus()
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
      data,
      isAdmin,
      lc,
      member: prevMember,
      newDaypass,
      newMember,
      tabIndex
    } = this.props
    const { member } = this.state
    const inputProps = {
      getDefaultValue: path => (prevMember && prevMember.getIn(path)) || '',
      getValue: path => member.getIn(path) || '',
      lc,
      onChange: (path, value) => this.handleChange(member.setIn(path, value)),
      tabIndex
    }
    return (
      <form>
        <NameEmailEdit
          inputRef={ref => {
            this.focusRef = ref
          }}
          isAdmin={isAdmin}
          isNew={newDaypass || newMember}
          member={member}
          onChange={this.handleChange}
          prevMember={prevMember}
        />
        {lc !== 'daypass' && (
          <BadgeEdit
            isAdmin={isAdmin}
            member={member}
            onChange={this.handleChange}
            prevMember={prevMember}
          />
        )}
        <PublicNameEdit
          isAdmin={isAdmin}
          member={member}
          onChange={this.handleChange}
          prevMember={prevMember}
        />
        <LocationEdit
          isAdmin={isAdmin}
          member={member}
          onChange={this.handleChange}
          prevMember={prevMember}
        />
        <PaperPubs
          data={data}
          isAdmin={isAdmin}
          newMember={newMember}
          {...inputProps}
        />
      </form>
    )
  }
}
