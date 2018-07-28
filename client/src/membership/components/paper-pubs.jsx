import { Map } from 'immutable'
import React from 'react'
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import ContentMail from 'material-ui/svg-icons/content/mail'
import { Col, Row } from 'react-flexbox-grid'

import { emptyPaperPubsMap } from '../constants'
import messages from '../messages'
import { hintStyle } from './MemberForm'

export const paperPubsIsValid = (pp) => (
  !pp || pp.get('name') && pp.get('address') && !!pp.get('country')
)

const AddressField = ({ autoFocus, field, hintText, multiLine = false, onChange, tabIndex, value }) => {
  return <TextField
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
}

const PaperPubsFields = ({ autoFocus, getDefaultValue, getValue, onChange, ppMsg, tabIndex }) => {
  const pp = getValue(['paper_pubs'])
  if (!Map.isMap(pp)) return null
  const errorStyle = { outline: '1px solid rgba(0, 0, 0, 0.5)', outlineOffset: -1 }
  return <Paper
    style={pp.some(v => !v) ? errorStyle : null}
    zDepth={1}
  >
    <AddressField
      autoFocus={autoFocus}
      field='name'
      hintText={ppMsg.name()}
      onChange={onChange}
      tabIndex={tabIndex}
      value={pp.get('name')}
    />
    <Divider />
    <AddressField
      field='address'
      hintText={ppMsg.address()}
      multiLine
      onChange={onChange}
      tabIndex={tabIndex}
      value={pp.get('address')}
    />
    <Divider />
    <AddressField
      field='country'
      hintText={ppMsg.country()}
      onChange={onChange}
      tabIndex={tabIndex}
      value={pp.get('country')}
    />
  </Paper>
}

export const AddPaperPubs = ({ data, getDefaultValue, getValue, lc = 'en', onChange, ...inputProps }) => {
  const amount = data && data.getIn(['types', 0, 'amount']) || 0
  const ppMsg = messages[lc].paper_pubs
  const label = ppMsg.label({ amount: amount / 100 })
  const hasPaperPubs = !!getValue(['paper_pubs'])
  return (
    <Row style={{ paddingTop: 16 }}>
      <Col xs={12} sm={6}>
        <Checkbox
          checkedIcon={<ContentMail />}
          disabled={!amount}
          label={label}
          checked={hasPaperPubs}
          onCheck={(ev, checked) => onChange(['paper_pubs'], checked ? emptyPaperPubsMap : null)}
          style={{ marginBottom: 4 }}
          {...inputProps}
          />
        <div style={hintStyle}>{ppMsg.new_hint()}</div>
        {hasPaperPubs ? <div style={hintStyle}>{ppMsg.new_hint2()}</div> : null }
      </Col>
      {hasPaperPubs ? (
        <Col xs={12} sm={6}>
          <PaperPubsFields
            autoFocus
            getValue={getValue}
            onChange={onChange}
            ppMsg={ppMsg}
            {...inputProps}
          />
        </Col>
      ) : null}
    </Row>
  )
}

export const EditPaperPubs = ({ lc = 'en', ...inputProps }) => (
  <Row style={{ paddingTop: 16 }}>
    <Col xs={12} sm={6}>
      <PaperPubsFields ppMsg={messages[lc].paper_pubs} {...inputProps} />
    </Col>
    <Col xs={12} sm={6} style={hintStyle}>
      {messages[lc].paper_pubs.edit_hint()}
    </Col>
  </Row>
)
