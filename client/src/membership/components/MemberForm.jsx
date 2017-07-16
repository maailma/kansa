import { Map } from 'immutable'
import FlatButton from 'material-ui/FlatButton'
import React, { PropTypes } from 'react'
const { Col, Row } = require('react-flexbox-grid')
const ImmutablePropTypes = require('react-immutable-proptypes')

import { midGray } from '../../theme'
import { emptyPaperPubsMap } from '../constants'
import messages from '../messages'
import { TextInput } from './form-components'
import { paperPubsIsValid, AddPaperPubs, EditPaperPubs } from './paper-pubs'
import PreviewBadge from './preview-badge'

export const hintStyle = {
  color: midGray,
  fontSize: 13,
  marginBottom: 24
}

export default class MemberForm extends React.Component {

  static propTypes = {
    lc: PropTypes.string,
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    newMember: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    prices: ImmutablePropTypes.map,
    tabIndex: PropTypes.number
  }

  static isValid(member) {
    return Map.isMap(member)
      && member.get('legal_name', false) && member.get('email', false)
      && paperPubsIsValid(member.get('paper_pubs'))
  }

  constructor(props) {
    super(props)
    this.state = {
      member: props.member || Map()
    }
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
    const { member, newMember } = this.props
    return this.state.member.filter(
      newMember || !member
        ? (value) => value
        : (value, key) => {
            let v0 = member.get(key)
            if (typeof value === 'string' && !v0) v0 = ''
            return Map.isMap(value) ? !value.equals(v0) : value !== v0
          }
    )
  }

  getDefaultValue = (path) => this.props.member && this.props.member.getIn(path) || ''
  getValue = (path) => this.state.member.getIn(path) || ''

  get hasPaperPubs() {
    return !!this.state.member.get('paper_pubs')
  }

  get isValid() {
    return MemberForm.isValid(this.state.member)
  }

  msg(key, params) {
    const { lc = 'en' } = this.props
    return messages[lc][key](params)
  }

  onChange = (path, value) => {
    this.setState({
      member: this.state.member.setIn(path, value)
    }, () => {
      this.props.onChange(this.isValid, this.changes)
    })
  }

  render() {
    const { lc, newMember, prices, tabIndex } = this.props
    const { member } = this.state
    const inputProps = {
      getDefaultValue: this.getDefaultValue,
      getValue: this.getValue,
      lc,
      onChange: this.onChange,
      tabIndex
    }
    return <form>
      <Row>
        <Col xs={12} sm={6}>
          <TextInput
            { ...inputProps }
            inputRef={ focusRef => this.focusRef = focusRef }
            path='legal_name'
            required={true}
          />
          <div style={hintStyle}>{this.msg('legal_name_hint')}</div>
        </Col>
        <Col xs={12} sm={6}>
          { newMember ? [
              <TextInput { ...inputProps } key="input" path='email' required={true} />,
              <div key="hint" style={hintStyle}>{this.msg('new_email_hint')}</div>
          ] : [
              <TextInput { ...inputProps } key="input" path='email' disabled={true} />,
              <div key="hint" style={hintStyle}>
                To change the email address associated with this membership, please
                get in touch with us at <a href="mailto:registration@worldcon.fi">
                registration@worldcon.fi</a>
              </div>
          ] }
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={6}>
          <TextInput { ...inputProps } path='badge_name' hintText={member.get('preferred_name')} />
        </Col>
        <Col xs={12} sm={6}>
          <TextInput { ...inputProps } path='badge_subtitle' hintText={member.get('country')} />
        </Col>
        <Col xs={12} style={hintStyle}>
          <PreviewBadge
            memberId={member.get('id')}
            name={member.get('badge_name') || member.get('preferred_name')}
            subtitle={member.get('badge_subtitle') || member.get('country')}
          >
            <FlatButton label='Preview' primary={true} style={{ float: 'right' }} />
          </PreviewBadge>
          {this.msg('badge_hint')}
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={6}>
          <TextInput { ...inputProps } path='public_first_name' />
        </Col>
        <Col xs={12} sm={6}>
          <TextInput { ...inputProps } path='public_last_name' />
        </Col>
        <Col xs={12} style={hintStyle}>{this.msg('public_name_hint')}</Col>
      </Row>
      <Row>
        <Col xs={12} sm={4}>
          <TextInput { ...inputProps } path='city' />
        </Col>
        <Col xs={12} sm={4}>
          <TextInput { ...inputProps } path='state' />
        </Col>
        <Col xs={12} sm={4}>
          <TextInput { ...inputProps } path='country' />
        </Col>
        <Col xs={12} style={hintStyle}>{this.msg('location_hint')}</Col>
      </Row>
      {!newMember && this.hasPaperPubs ? (
        <EditPaperPubs
          prices={prices}
          {...inputProps}
        />
      ) : null}
    </form>
  }

  componentDidMount() {
    this.focusRef && this.focusRef.focus()
  }
}
