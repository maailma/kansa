import React from 'react'
const { Col, Row } = require('react-flexbox-grid');

import KeyRequest from './KeyRequest'

export default () => <Row>
  <Col
    xs={8} xsOffset={2}
    sm={6} smOffset={3}
  >
    <KeyRequest/>
  </Col>
</Row>;