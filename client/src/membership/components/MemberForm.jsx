import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Message } from 'react-message-context'

import { hintStyle } from '../../lib/hint-text'
import TextInput from '../../lib/text-input'
import * as PaymentPropTypes from '../../payments/proptypes'
import BadgeRow from '../form/badge-row'
import NameEmailRow from '../form/name-email-row'
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

  componentWillReceiveProps(nextProps) {
    const { member, onChange } = nextProps
    if (!member) {
      this.setState({ member: Map() })
    } else if (!member.equals(this.props.member)) {
      this.setState({ member }, () => {
        onChange(this.isValid, this.changes)
      })
    }
  }

  get changes() {
    const { member, newDaypass, newMember } = this.props
    return this.state.member.filter(
      newDaypass || newMember || !member
        ? value => value
        : (value, key) => {
            let v0 = member.get(key)
            if (typeof value === 'string' && !v0) v0 = ''
            return Map.isMap(value) ? !value.equals(v0) : value !== v0
          }
    )
  }

  getDefaultValue = path =>
    (this.props.member && this.props.member.getIn(path)) || ''
  getValue = path => this.state.member.getIn(path) || ''

  get isValid() {
    return MemberForm.isValid(this.state.member)
  }

  handleChange = member => {
    this.setState({ member }, () => {
      this.props.onChange(this.isValid, this.changes)
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
      getDefaultValue: this.getDefaultValue,
      getValue: this.getValue,
      lc,
      onChange: (path, value) => this.handleChange(member.setIn(path, value)),
      tabIndex
    }
    return (
      <form>
        <NameEmailRow
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
          <BadgeRow
            isAdmin={isAdmin}
            member={member}
            onChange={this.handleChange}
            prevMember={prevMember}
          />
        )}
        <Row>
          <Col xs={12} sm={6}>
            <TextInput {...inputProps} path="public_first_name" />
          </Col>
          <Col xs={12} sm={6}>
            <TextInput {...inputProps} path="public_last_name" />
          </Col>
          {!isAdmin && (
            <Col xs={12} style={hintStyle}>
              <Message id="public_name_hint" />
            </Col>
          )}
        </Row>
        <Row>
          <Col xs={12} sm={4}>
            <TextInput {...inputProps} path="city" />
          </Col>
          <Col xs={12} sm={4}>
            <TextInput {...inputProps} path="state" />
          </Col>
          <Col xs={12} sm={4}>
            <TextInput {...inputProps} path="country" />
          </Col>
          {!isAdmin && (
            <Col xs={12} style={hintStyle}>
              <Message id="location_hint" />
            </Col>
          )}
        </Row>
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
