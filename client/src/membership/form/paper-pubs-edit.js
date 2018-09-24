import { Map } from 'immutable'
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import ContentMail from 'material-ui/svg-icons/content/mail'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import { Message } from 'react-message-context'
import { connect } from 'react-redux'

import { ConfigConsumer } from '../../lib/config-context'
import HintText, { hintStyle } from '../../lib/hint-text'

export const paperPubsIsValid = pp =>
  !pp || (pp.get('name') && pp.get('address') && !!pp.get('country'))

// FIXME: Hacked for kansa-admin/components/form
export const newPaperPubs = member => {
  const name =
    (member.get ? member.get('legal_name') : member(['legal_name'])) || ''
  const country =
    (member.get ? member.get('country') : member(['country'])) || ''
  return Map({ name, address: '', country })
}

const AddressField = ({ multiLine = false, ...props }) => {
  return (
    <TextField
      {...props}
      fullWidth
      hintStyle={multiLine ? { bottom: 36 } : null}
      multiLine={multiLine}
      required
      rows={multiLine ? 2 : 1}
      style={{ marginLeft: 16 }}
      underlineShow={false}
    />
  )
}

const PaperPubsFields = ({ autoFocus, member, onChange, tabIndex }) => {
  const pp = member.get('paper_pubs')
  if (!Map.isMap(pp)) return null
  const errorStyle = {
    outline: '1px solid rgba(0, 0, 0, 0.5)',
    outlineOffset: -1
  }
  const handleChange = field => (ev, value) => {
    onChange(member.setIn(['paper_pubs', field], value))
  }
  return (
    <Paper style={pp.some(v => !v) ? errorStyle : null} zDepth={1}>
      <AddressField
        autoFocus={autoFocus}
        field="name"
        hintText={<Message id="paper_pubs.name" />}
        onChange={handleChange('name')}
        tabIndex={tabIndex}
        value={pp.get('name')}
      />
      <Divider />
      <AddressField
        field="address"
        hintText={<Message id="paper_pubs.address" />}
        multiLine
        onChange={handleChange('address')}
        tabIndex={tabIndex}
        value={pp.get('address')}
      />
      <Divider />
      <AddressField
        field="country"
        hintText={<Message id="paper_pubs.country" />}
        onChange={handleChange('country')}
        tabIndex={tabIndex}
        value={pp.get('country')}
      />
    </Paper>
  )
}

let PaperPubsCheckbox = ({ paid_paper_pubs, ppAmount, ...props }) => (
  <Checkbox
    checkedIcon={<ContentMail />}
    disabled={paid_paper_pubs && !ppAmount}
    label={
      <Message
        id="paper_pubs.label"
        amount={ppAmount / 100}
        paid_paper_pubs={paid_paper_pubs}
      />
    }
    style={{ marginBottom: 4 }}
    {...props}
  />
)

PaperPubsCheckbox = connect(
  ({ purchase }) => {
    const path = ['data', 'paper_pubs', 'types', 'paper_pubs', 'amount']
    return { ppAmount: purchase.getIn(path) || 0 }
  },
  {}
)(PaperPubsCheckbox)

const PaperPubsEdit = ({
  isAdmin,
  isNew,
  member,
  onChange,
  paid_paper_pubs,
  prevMember,
  tabIndex
}) => {
  const hasPaperPubs = !!member.get('paper_pubs')
  const prevPaperPubs = !isNew && prevMember && prevMember.get('paper_pubs')
  if (paid_paper_pubs && !isNew && !prevPaperPubs) return null
  return (
    <Row style={{ paddingTop: 16 }}>
      {isNew || !paid_paper_pubs ? (
        <Col xs={12} sm={6}>
          <PaperPubsCheckbox
            checked={hasPaperPubs}
            onCheck={(ev, checked) => {
              const pp = checked ? prevPaperPubs || newPaperPubs(member) : null
              onChange(member.set('paper_pubs', pp))
            }}
            paid_paper_pubs={paid_paper_pubs}
            tabIndex={tabIndex}
          />
          {!isAdmin && [
            <HintText
              key="cb"
              msgId="paper_pubs.hint_checkbox"
              msgParams={{ paid_paper_pubs }}
            />,
            hasPaperPubs && (
              <HintText key="fields" msgId="paper_pubs.hint_fields" />
            )
          ]}
        </Col>
      ) : isAdmin ? (
        <Col xs={12} sm={6} style={{ textAlign: 'right' }}>
          <Message id="paper_pubs.label" />
        </Col>
      ) : (
        <Col xs={12} sm={6} style={hintStyle}>
          <Message id="paper_pubs.hint_fields" />
        </Col>
      )}
      {hasPaperPubs ? (
        <Col xs={12} sm={6}>
          <PaperPubsFields
            autoFocus={!prevPaperPubs && hasPaperPubs}
            member={member}
            onChange={onChange}
            tabIndex={tabIndex}
          />
        </Col>
      ) : null}
    </Row>
  )
}

PaperPubsEdit.propTypes = {
  isAdmin: PropTypes.bool,
  isNew: PropTypes.bool,
  lc: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  tabIndex: PropTypes.number
}

export default props => (
  <ConfigConsumer>
    {config => (
      <PaperPubsEdit {...props} paid_paper_pubs={config.paid_paper_pubs} />
    )}
  </ConfigConsumer>
)
