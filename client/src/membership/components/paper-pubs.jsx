import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import ContentMail from 'material-ui/svg-icons/content/mail'
import { Col, Row } from 'react-flexbox-grid'

import { ConfigConsumer } from '../../lib/config-context'
import * as PaymentPropTypes from '../../payments/proptypes'
import messages from '../messages'
import { hintStyle } from './MemberForm'

export const paperPubsIsValid = pp =>
  !pp || (pp.get('name') && pp.get('address') && !!pp.get('country'))

export const newPaperPubs = getValue => {
  const name = getValue(['legal_name']) || ''
  const country = getValue(['country']) || ''
  return Map({ name, address: '', country })
}

const AddressField = ({
  autoFocus,
  field,
  hintText,
  multiLine = false,
  onChange,
  tabIndex,
  value
}) => {
  return (
    <TextField
      autoFocus={autoFocus}
      fullWidth
      hintStyle={multiLine ? { bottom: 36 } : null}
      hintText={hintText}
      multiLine={multiLine}
      required
      rows={multiLine ? 2 : 1}
      style={{ marginLeft: 16 }}
      tabIndex={tabIndex}
      underlineShow={false}
      value={value}
      onChange={ev => onChange(['paper_pubs', field], ev.target.value)}
    />
  )
}

const PaperPubsFields = ({
  autoFocus,
  getDefaultValue,
  getValue,
  onChange,
  ppMsg,
  tabIndex
}) => {
  const pp = getValue(['paper_pubs'])
  if (!Map.isMap(pp)) return null
  const errorStyle = {
    outline: '1px solid rgba(0, 0, 0, 0.5)',
    outlineOffset: -1
  }
  return (
    <Paper style={pp.some(v => !v) ? errorStyle : null} zDepth={1}>
      <AddressField
        autoFocus={autoFocus}
        field="name"
        hintText={ppMsg.name()}
        onChange={onChange}
        tabIndex={tabIndex}
        value={pp.get('name')}
      />
      <Divider />
      <AddressField
        field="address"
        hintText={ppMsg.address()}
        multiLine
        onChange={onChange}
        tabIndex={tabIndex}
        value={pp.get('address')}
      />
      <Divider />
      <AddressField
        field="country"
        hintText={ppMsg.country()}
        onChange={onChange}
        tabIndex={tabIndex}
        value={pp.get('country')}
      />
    </Paper>
  )
}

const PaperPubsCheckbox = ({ data, ppMsg, paid_paper_pubs, ...props }) => {
  const amount =
    (data && data.getIn(['paper_pubs', 'types', 'paper_pubs', 'amount'])) || 0
  const label = ppMsg.label({
    amount: amount / 100,
    paid_paper_pubs
  })
  return (
    <Checkbox
      checkedIcon={<ContentMail />}
      disabled={paid_paper_pubs && !amount}
      label={label}
      style={{ marginBottom: 4 }}
      {...props}
    />
  )
}

const PaperPubs = ({
  data,
  getDefaultValue,
  getValue,
  isAdmin,
  lc,
  newMember,
  onChange,
  tabIndex
}) => (
  <ConfigConsumer>
    {({ paid_paper_pubs }) => {
      const hasPaperPubs = !!getValue(['paper_pubs'])
      const prevPaperPubs =
        !newMember && getDefaultValue && getDefaultValue(['paper_pubs'])
      if (!newMember && paid_paper_pubs && !prevPaperPubs) return null
      const ppMsg = (messages[lc] || messages.en).paper_pubs
      return (
        <Row style={{ paddingTop: 16 }}>
          {newMember || !paid_paper_pubs ? (
            <Col xs={12} sm={6}>
              <PaperPubsCheckbox
                checked={hasPaperPubs}
                data={data}
                onCheck={(ev, checked) =>
                  onChange(
                    ['paper_pubs'],
                    checked ? prevPaperPubs || newPaperPubs(getValue) : null
                  )
                }
                ppMsg={ppMsg}
                paid_paper_pubs={paid_paper_pubs}
                tabIndex={tabIndex}
              />
              {!isAdmin && (
                <div style={hintStyle}>
                  {ppMsg.hint_checkbox({ paid: true })}
                </div>
              )}
              {!isAdmin && hasPaperPubs ? (
                <div style={hintStyle}>{ppMsg.hint_fields()}</div>
              ) : null}
            </Col>
          ) : isAdmin ? (
            <Col xs={12} sm={6} style={{ textAlign: 'right' }}>
              {ppMsg.label({})}
            </Col>
          ) : (
            <Col xs={12} sm={6} style={hintStyle}>
              {ppMsg.hint_fields()}
            </Col>
          )}
          {hasPaperPubs ? (
            <Col xs={12} sm={6}>
              <PaperPubsFields
                autoFocus={!prevPaperPubs && hasPaperPubs}
                getDefaultValue={getDefaultValue}
                getValue={getValue}
                onChange={onChange}
                ppMsg={ppMsg}
                tabIndex={tabIndex}
              />
            </Col>
          ) : null}
        </Row>
      )
    }}
  </ConfigConsumer>
)

PaperPubs.propTypes = {
  data: PaymentPropTypes.data,
  getDefaultValue: PropTypes.func,
  getValue: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  lc: PropTypes.string,
  newMember: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  tabIndex: PropTypes.number
}

export default PaperPubs
