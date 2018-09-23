import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'

import { ConfigConsumer } from '../../lib/config-context'
import DataTextField from '../../lib/data-text-field'
import PreviewBadge from './preview-badge'

import { disabledColor } from '../../theme/colors'
const hintStyle = {
  color: disabledColor,
  fontSize: 13,
  marginBottom: 24
}

const BadgeNameField = ({ member, onChange, prevMember }) => (
  <DataTextField
    data={member}
    hintText={member.get('preferred_name')}
    multiLine
    onChange={onChange}
    path="badge_name"
    prev={prevMember}
    rowsMax={2}
  />
)

const BadgeSubtitleField = ({ member, onChange, prevMember }) => (
  <DataTextField
    data={member}
    hintText={member.get('country')}
    onChange={onChange}
    path="badge_subtitle"
    prev={prevMember}
  />
)

const BadgeRow = ({ getMsg, isAdmin, member, onChange, prevMember }) => {
  const props = { member, onChange, prevMember }
  return isAdmin ? (
    <Row style={{ alignItems: 'flex-end' }}>
      <Col xs={12} sm={6}>
        <BadgeNameField {...props} />
      </Col>
      <Col xs={12} sm={3} md={4}>
        <BadgeSubtitleField {...props} />
      </Col>
      <Col xs={12} sm={3} md={2}>
        <PreviewBadge buttonStyle={{ float: 'right' }} member={member} />
      </Col>
    </Row>
  ) : (
    <Row style={{ alignItems: 'flex-end' }}>
      <Col xs={12} sm={6}>
        <BadgeNameField {...props} />
      </Col>
      <Col xs={12} sm={6}>
        <BadgeSubtitleField {...props} />
      </Col>
      <Col xs={12} style={hintStyle}>
        <PreviewBadge buttonStyle={{ float: 'right' }} member={member} />
        {getMsg('badge_hint')}
      </Col>
    </Row>
  )
}

BadgeRow.propTypes = {
  getMsg: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  member: ImmutablePropTypes.map.isRequired,
  onChange: PropTypes.func.isRequired,
  prevMember: ImmutablePropTypes.map
}

export default props => (
  <ConfigConsumer>
    {({ getMemberAttr, modules }) =>
      modules.badge && getMemberAttr(props.member).badge ? (
        <BadgeRow {...props} />
      ) : null
    }
  </ConfigConsumer>
)
