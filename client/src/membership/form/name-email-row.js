import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import { Message } from 'react-message-context'

import DataTextField from '../../lib/data-text-field'
import { disabledColor } from '../../theme/colors'

const hintStyle = {
  color: disabledColor,
  fontSize: 13,
  marginBottom: 24
}

const NameField = ({ inputRef, member, onChange, prevMember }) => (
  <DataTextField
    data={member}
    hintText={member.get('legal_name')}
    inputRef={inputRef}
    onChange={onChange}
    path="legal_name"
    prev={prevMember}
    required
  />
)

const EmailField = ({ disabled, member, onChange, prevMember }) => (
  <DataTextField
    data={member}
    disabled={disabled}
    onChange={onChange}
    path="email"
    prev={prevMember}
    required={!disabled}
  />
)

const NameEmailRow = ({
  inputRef,
  isAdmin,
  isNew,
  member,
  onChange,
  prevMember
}) => {
  const props = { member, onChange, prevMember }
  const disabledEmail = !isAdmin && !isNew
  return (
    <Row>
      <Col xs={12} sm={6}>
        <NameField inputRef={inputRef} {...props} />
        {!isAdmin && (
          <div style={hintStyle}>
            <Message id="legal_name_hint" />
          </div>
        )}
      </Col>
      <Col xs={12} sm={6}>
        <EmailField disabled={disabledEmail} {...props} />
        {isAdmin ? null : isNew ? (
          <div key="hint" style={hintStyle}>
            <Message id="new_email_hint" />
          </div>
        ) : (
          <div key="hint" style={hintStyle}>
            To change the email address associated with this membership, please
            get in touch with us at{' '}
            <a href="mailto:registration@worldcon.fi">
              registration@worldcon.fi
            </a>
          </div>
        )}
      </Col>
    </Row>
  )
}
export default NameEmailRow
