import React from 'react'
import { connect } from 'react-redux'

import FloatingActionButton from 'material-ui/FloatingActionButton'
import MergeIcon from 'material-ui/svg-icons/editor/merge-type'

import { classify } from '../actions'

const NominationMerger = ({ classify, nominations, onSuccess, selected }) => (
  <FloatingActionButton
    onClick={() => {
      const canonIds = selected
        .map(sel => sel.get('canon_id'))
        .filter(id => !!id)
      let canon = null
      switch (canonIds.size) {
        case 0:
          canon = selected.first().get('data')
          break

        case 1:
          canon = canonIds.first()
          selected = selected.filter(sel => sel.get('canon_id') !== canon)
          break

        default:
          canon = canonIds.first()
          const otherIds = canonIds.rest()
          selected = selected.filterNot(sel => sel.get('canon_id')).concat(
            nominations
              .valueSeq()
              .flatten(true)
              .filter(nom => {
                const ci = nom.get('canon_id')
                return ci && otherIds.contains(ci)
              })
          )
          // TODO: remove empty canonicalisations
          break
      }
      const categories = Object.keys(
        selected.reduce((categories, sel) => {
          categories[sel.get('category')] = true
          return categories
        }, {})
      )
      categories.forEach(category => {
        const catData = selected
          .filter(sel => sel.get('category') === category)
          .map(sel => sel.get('data'))
        classify(category, catData, canon)
      })
      onSuccess()
    }}
    style={{
      bottom: 24,
      position: 'fixed',
      right: 24,
      zIndex: 1
    }}
  >
    <MergeIcon />
  </FloatingActionButton>
)

export default connect(
  ({ hugoAdmin }) => ({
    nominations: hugoAdmin.get('nominations')
  }),
  {
    classify
  }
)(NominationMerger)
