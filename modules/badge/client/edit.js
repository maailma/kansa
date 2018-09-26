import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Message, withLocale } from 'react-message-context'

import DataTextField from '@kansa/client-lib/data-text-field'
import { hintStyle } from '@kansa/client-lib/hint-text'
import BadgePreview from './preview'

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

const BadgeEdit = ({ isAdmin, member, onChange, prevMember }) => {
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
        <BadgePreview buttonStyle={{ float: 'right' }} member={member} />
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
        <BadgePreview buttonStyle={{ float: 'right' }} member={member} />
        <Message id="badge_hint" />
      </Col>
    </Row>
  )
}

BadgeEdit.propTypes = {
  isAdmin: PropTypes.bool,
  member: ImmutablePropTypes.map.isRequired,
  onChange: PropTypes.func.isRequired,
  prevMember: ImmutablePropTypes.map
}

export default withLocale(
  props =>
    props.locale !== 'daypass' && !props.member.get('daypass') ? (
      <BadgeEdit {...props} />
    ) : null
)
