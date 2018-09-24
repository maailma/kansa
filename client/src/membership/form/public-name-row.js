import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import { Message } from 'react-message-context'

import DataTextField from '../../lib/data-text-field'
import { hintStyle } from '../../lib/hint-text'

const PublicNameRow = ({ isAdmin, member, onChange, prevMember }) => (
  <Row>
    <Col xs={12} sm={6}>
      <DataTextField
        data={member}
        onChange={onChange}
        path="public_first_name"
        prev={prevMember}
      />
    </Col>
    <Col xs={12} sm={6}>
      <DataTextField
        data={member}
        onChange={onChange}
        path="public_last_name"
        prev={prevMember}
      />
    </Col>
    {!isAdmin && (
      <Col xs={12} style={hintStyle}>
        <Message id="public_name_hint" />
      </Col>
    )}
  </Row>
)

export default PublicNameRow
