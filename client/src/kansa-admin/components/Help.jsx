import PropTypes from 'prop-types'
import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

import { filterTerms } from '../filterPeople'
import { memberFields, membershipTypes } from './Member'

const styleTerm = (src) => src.split('_').map((val, idx) => (idx % 2) ? <i key={idx}>{val}</i> : val)

const listKeys = (list) => {
  const lastIdx = list.length - 1
  return list.reduce((res, key, idx) => {
    const entry = <code key={key}>{key}</code>
    if (idx < lastIdx) res.push(entry, ', ')
    else {
      if (idx > 0) res[res.length - 1] = ', and '
      res.push(entry)
    }
    return res
  }, [])
}

export const helpText = [
  <p key='p1'>
    The search terms are matched case-insensitively to the fields of each member,
    with results being updated as they're entered.
  </p>,
  <p key='p2'>
    The accepted values of <i>field</i> include { listKeys(memberFields) }.
    Similarly, valid <i>membership</i> types are { listKeys(membershipTypes) }.
  </p>,
  <dl key='dl'>{
    filterTerms.reduce((res, term, idx) => res.concat(
      <dt key={`dt-${idx}`}>{styleTerm(term[0])}</dt>,
      <dd key={`dd-${idx}`} style={{ marginBottom: 8 }}>{styleTerm(term[1])}</dd>
    ), [])
  }</dl>
]

export const HelpDialog = ({ open, handleClose }) => (
  <Dialog
    actions={<FlatButton label='Close' onTouchTap={handleClose} />}
    open={open}
    autoScrollBodyContent
    onRequestClose={handleClose}
  >
    { helpText }
  </Dialog>
)

HelpDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
}
