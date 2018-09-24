import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import { Message } from 'react-message-context'

import TextInput from '../../lib/text-input'
import { disabledColor } from '../../theme/colors'

const hintStyle = {
  color: disabledColor,
  fontSize: 13,
  marginBottom: 24
}

const NameEmailRow = ({ inputProps, inputRef, isAdmin, isNew }) => {
  return (
    <Row>
      <Col xs={12} sm={6}>
        <TextInput
          {...inputProps}
          inputRef={inputRef}
          path="legal_name"
          required
        />
        {!isAdmin && (
          <div style={hintStyle}>
            <Message id="legal_name_hint" />
          </div>
        )}
      </Col>
      <Col xs={12} sm={6}>
        {isAdmin || isNew
          ? [
              <TextInput {...inputProps} key="input" path="email" required />,
              !isAdmin && (
                <div key="hint" style={hintStyle}>
                  <Message id="new_email_hint" />
                </div>
              )
            ]
          : [
              <TextInput {...inputProps} key="input" path="email" disabled />,
              <div key="hint" style={hintStyle}>
                To change the email address associated with this membership,
                please get in touch with us at{' '}
                <a href="mailto:registration@worldcon.fi">
                  registration@worldcon.fi
                </a>
              </div>
            ]}
      </Col>
    </Row>
  )
}
export default NameEmailRow
