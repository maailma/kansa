import React from 'react'
import { Col, Row } from 'react-flexbox-grid'

import DataTextField from '../../lib/data-text-field'
import HintText from '../../lib/hint-text'

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

const NameEmailEdit = ({ inputRef, isAdmin, isNew, ...props }) => {
  const disabledEmail = !isAdmin && !isNew
  return (
    <Row>
      <Col xs={12} sm={6}>
        <NameField inputRef={inputRef} {...props} />
        {!isAdmin && <HintText msgId="legal_name_hint" />}
      </Col>
      <Col xs={12} sm={6}>
        <EmailField disabled={disabledEmail} {...props} />
        {isAdmin ? null : isNew ? (
          <HintText msgId="new_email_hint" />
        ) : (
          <HintText>
            To change the email address associated with this membership, please
            get in touch with us at{' '}
            <a href="mailto:registration@worldcon.fi">
              registration@worldcon.fi
            </a>
          </HintText>
        )}
      </Col>
    </Row>
  )
}
export default NameEmailEdit
