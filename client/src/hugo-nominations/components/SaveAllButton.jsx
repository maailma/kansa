import React from 'react'
import { connect } from 'react-redux'

import Badge from 'material-ui/Badge'
import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import ListCheck from 'material-ui/svg-icons/av/playlist-add-check'
import transitions from 'material-ui/styles/transitions'

import { submitNominations } from '../actions'

const SaveAllButton = ({ changedCategories, signature, submitNominations }) => (
  <Paper
    circle={true}
    className='SaveAllButton'
    style={{
      opacity: changedCategories.size ? 1 : 0,
      transition: transitions.easeOut(),
      visibility: changedCategories.size ? 'visible' : 'hidden'
    }}
    zDepth={2}
  >
    <Badge
      badgeContent={changedCategories.size}
      badgeStyle={{
        fontWeight: 'bold',
        pointerEvents: 'none',
        right: -6,
        top: -6,
        zoom: 1.1
      }}
      primary={true}
      style={{ padding: 0 }}
    >
      <IconButton
        disabled={ changedCategories.size == 0 }
        onTouchTap={ () => changedCategories.keySeq().forEach(category => submitNominations(category, signature)) }
        style={{
          transition: transitions.easeOut(),
          position: 'relative',
          height: 56,
          width: 56,
          padding: 0,
          borderRadius: '50%',
          textAlign: 'center',
          verticalAlign: 'bottom'
        }}
        tooltip='Click here to save all categories'
        tooltipPosition='top-left'
        tooltipStyles={{
          fontSize: 12,
          right: 64,
          marginTop: 40
        }}
      >
        <ListCheck />
      </IconButton>
    </Badge>
  </Paper>
);

export default connect(
  ({ nominations }) => ({
    changedCategories: nominations.filterNot(data => data.get('clientData').equals(data.get('serverData')))
  }), {
    submitNominations
  }
)(SaveAllButton);

