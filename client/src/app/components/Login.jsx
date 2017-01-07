import React from 'react'
import Paper from 'material-ui/Paper'
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
      <Paper
        style={{
          backgroundColor: '#fafafa',
          padding: 24,
        }}
      >
        To access your membership details, please enter your email address below, and a login link will be sent to you.
        This address will need to match the one we have in our database for you; it's the one that you provided when
        signing up, and at which you've previously received messages from us.
        <KeyRequest/>
      </Paper>
      <p>
        If you're not able to enter a valid address, or if you do not receive the login link within 30 minutes or so,
        please get in touch with us at <a href="mailto:registration@worldcon.fi">registration@worldcon.fi</a> and we'll
        help you get sorted.
      </p>
      <p>
        If your email address is associated with more than one membership that is eligible to nominate in the 2017 Hugo
        Awards, you'll need to use the separately emailed Hugo Nominations login link to access your nominations. For
        further assistance with Hugo nominations, please e-mail <a href="mailto:hugohelp@worldcon.fi">hugohelp@worldcon.fi</a>.
      </p>
      <p>
        To join Worldcon 75 as a new member, please use our <a href="https://shop.worldcon.fi/">online shop</a>.
      </p>
    </Col>
  </Row>
</div>;