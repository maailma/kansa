import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import { Message } from 'react-message-context'

import DataTextField from '../../lib/data-text-field'
import { hintStyle } from '../../lib/hint-text'

const LocationEdit = ({ isAdmin, member, onChange, prevMember }) => (
  <Row>
    <Col xs={12} sm={4}>
      <DataTextField
        data={member}
        onChange={onChange}
        path="city"
        prev={prevMember}
      />
    </Col>
    <Col xs={12} sm={4}>
      <DataTextField
        data={member}
        onChange={onChange}
        path="state"
        prev={prevMember}
      />
    </Col>
    <Col xs={12} sm={4}>
      <DataTextField
        data={member}
        onChange={onChange}
        path="country"
        prev={prevMember}
      />
    </Col>
    {!isAdmin && (
      <Col xs={12} style={hintStyle}>
        <Message id="location_hint" />
      </Col>
    )}
  </Row>
)

export default LocationEdit
