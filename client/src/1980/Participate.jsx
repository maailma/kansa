import React from 'react'
import Paper from 'material-ui/Paper'
const { Col, Row } = require('react-flexbox-grid');

import KeyRequest from '../app/components/KeyRequest'
import Intro from './Intro'

export default () => <div>
  <Row>
    <Col xs={10} xsOffset={1}>
      <h1>The 1980 Timewarp Project</h1>
    </Col>
  </Row>
  <Row>
    <Col
      xs={8} xsOffset={2}
      sm={6} smOffset={3}
      md={4} mdOffset={0}
      lg={3} lgOffset={0}
    >
      <Paper
        style={{
          backgroundColor: '#fafafa',
          padding: 24,
        }}
      >
        To participate in the project, please enter your email address below, and a login link will be sent to you.
        <KeyRequest>
          <p>Thank you for your participation! We hope you enjoy thinking back to an earlier time.</p>
        </KeyRequest>
      </Paper>
    </Col>
    <Col
      xs={10} xsOffset={1}
      sm={8} smOffset={2}
      md={6} mdOffset={1}
      lg={5} lgOffset={2}
      first='md'
      style={{ paddingTop: 8 }}
    >
      <Intro showMore={true}/>
    </Col>
</Row>
</div>;
