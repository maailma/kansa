import React from 'react'
const { Col, Row } = require('react-flexbox-grid');

import KeyRequest from './KeyRequest'

export default () => <div>
  <Row>
    <Col xs={10} xsOffset={1}>
      <h1>Worldcon 75 Member Services</h1>
    </Col>
  </Row>
  <Row>
    <Col
      xs={8} xsOffset={2}
      sm={6} smOffset={3}
    >
      <KeyRequest/>
    </Col>
  </Row>
</div>;