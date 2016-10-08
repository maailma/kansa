import React from 'react'
import Paper from 'material-ui/Paper'
const { Col, Row } = require('react-flexbox-grid');

import LoginForm from './LoginForm'

export default () => <Row center="xs">
  <Col xs={10} sm={6} md={4} lg={3} >
    <Paper
      style={{
        backgroundColor: '#fafafa',
        padding: 24,
        marginTop: 48
      }}
    >
      <LoginForm/>
    </Paper>
  </Col>
</Row>;