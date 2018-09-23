import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-flexbox-grid'

import TextInput from '../../lib/text-input'
import PreviewBadge from './preview-badge'
import { ConfigConsumer } from '../../lib/config-context'

const PreviewBadgeButton = ({ member, style }) => (
  <PreviewBadge
    memberId={member.get('id')}
    name={member.get('badge_name') || member.get('preferred_name')}
    subtitle={member.get('badge_subtitle') || member.get('country')}
  >
    <FlatButton label="Preview" primary style={style} />
  </PreviewBadge>
)

const BadgeRow = ({ getMsg, inputProps, isAdmin, member }) => (
  <ConfigConsumer>
    {({ getMemberAttr }) =>
      getMemberAttr(member).badge ? (
        <Row style={{ alignItems: 'flex-end' }}>
          <Col xs={12} sm={6}>
            <TextInput
              hintText={member.get('preferred_name')}
              multiLine
              path="badge_name"
              rowsMax={2}
              {...inputProps}
            />
          </Col>
          <Col xs={12} sm={isAdmin ? 3 : 6} md={isAdmin ? 4 : 6}>
            <TextInput
              {...inputProps}
              path="badge_subtitle"
              hintText={member.get('country')}
            />
          </Col>
          {isAdmin ? (
            <Col xs={12} sm={3} md={2}>
              <PreviewBadgeButton member={member} style={{ float: 'right' }} />
            </Col>
          ) : (
            <Col xs={12} style={hintStyle}>
              <PreviewBadgeButton member={member} style={{ float: 'right' }} />
              {getMsg('badge_hint')}
            </Col>
          )}
        </Row>
      ) : null
    }
  </ConfigConsumer>
)

export default BadgeRow
