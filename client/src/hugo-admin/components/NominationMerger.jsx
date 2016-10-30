import React from 'react'

import FloatingActionButton from 'material-ui/FloatingActionButton'
import MergeIcon from 'material-ui/svg-icons/editor/merge-type'

export default ({ category, classify, nominations, onSuccess, selected }) => (
  <FloatingActionButton
    onTouchTap={() => {
      const canonIds = selected.map(sel => sel.get('canon_id')).filter(id => !!id);
      let canon = null;
      switch (canonIds.size) {

        case 0:
          canon = selected.first().get('data');
          break;

        case 1:
          canon = canonIds.first();
          selected = selected.filter(sel => sel.get('canon_id') !== canon);
          break;

        default:
          canon = canonIds.first();
          const otherIds = canonIds.rest();
          selected = selected
            .filterNot(sel => sel.get('canon_id'))
            .concat(nominations.filter(nom => {
              const ci = nom.get('canon_id');
              return ci && otherIds.contains(ci);
            }));
          // TODO: remove empty canonicalisations
          break;

      }
      classify(category, selected.map(sel => sel.get('data')), canon);
      onSuccess();
    }}
    style={{
      bottom: 24,
      position: 'fixed',
      right: 24,
      zIndex: 1
    }}
  >
    <MergeIcon/>
  </FloatingActionButton>
);
