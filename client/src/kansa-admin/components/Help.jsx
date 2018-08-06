import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

import { ConfigConsumer } from '../../lib/config-context'
import { filterTerms } from '../filterPeople'
import { memberFields } from './Member'

const styleTerm = src =>
  src.split('_').map((val, idx) => (idx % 2 ? <i key={idx}>{val}</i> : val))

const listKeys = list => {
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

export const HelpDialog = ({ open, handleClose }) => (
  <ConfigConsumer>
    {({ membershipTypes }) => (
      <Dialog
        actions={<FlatButton label="Close" onClick={handleClose} />}
        open={open}
        autoScrollBodyContent
        onRequestClose={handleClose}
      >
        <p>
          The search terms are matched case-insensitively to the fields of each
          member, with results being updated as they're entered.
        </p>
        <p>
          The accepted values of <i>field</i> include {listKeys(memberFields)}.
        </p>
        <p>
          Similarly, valid <i>membership</i> types are{' '}
          {listKeys(Object.keys(membershipTypes || {}))}.
        </p>
        <dl>
          {filterTerms.reduce(
            (res, term, idx) =>
              res.concat(
                <Fragment key={term[0]}>
                  <dt>{styleTerm(term[0])}</dt>
                  <dd style={{ marginBottom: 8 }}>{styleTerm(term[1])}</dd>
                </Fragment>
              ),
            []
          )}
        </dl>
      </Dialog>
    )}
  </ConfigConsumer>
)

HelpDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
}
