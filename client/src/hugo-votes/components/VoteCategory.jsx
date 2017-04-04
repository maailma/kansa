import { List as ImmutableList, Map as ImmutableMap } from 'immutable'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import ListCheck from 'material-ui/svg-icons/av/playlist-add-check'
import ContentUndo from 'material-ui/svg-icons/content/undo'
const { Col, Row } = require('react-flexbox-grid');

import time_diff from '../../lib/time_diff'
import { categoryInfo, nominationFields } from '../../hugo-nominations/constants'
import { setVotes } from '../actions'
import { categories } from '../constants'
import * as VotePropTypes from '../proptypes'

import VoteList from './VoteList'

const demoFinalists = (category) => {
  const labels = categoryInfo[category].nominationFieldLabels;
  return ['A', 'B', 'C', 'D', 'E', 'F']
    .map(x => Object.keys(labels).reduce((data, field) => {
      data[field] = labels[field] + ' ' + x;
      return data;
    }, {}));
}

class VoteCategory extends React.Component {
  static propTypes = {
    category: PropTypes.oneOf(categories),
    finalists: VotePropTypes.categoryFinalists,
    preference: VotePropTypes.categoryVotes,
    setVotes: PropTypes.func.isRequired
  }

  render() {
    const { category, finalists, preference, setVotes } = this.props;
    const { title, description } = categoryInfo[category];

    return <Card className='NominationCategory'>
      <CardHeader
        className='NominationHeader'
        title={title}
        titleStyle={{
          fontSize: 24,
          fontWeight: 300,
          textAlign: 'center',
          width: '100%',
        }}
      />
      <CardText>
        { description }
      </CardText>
      <CardText>
        <VoteList
          finalists={finalists}
          preference={preference}
          setPreference={(preference) => {
            setVotes(ImmutableMap([[category, preference]]));
          }}
        />
      </CardText>
    </Card>
  }
}

export default connect(
  ({ hugoVotes }, { category }) => ({
    finalists: hugoVotes.getIn(['finalists', category]) || ImmutableMap(),
    preference: hugoVotes.getIn(['clientVotes',category]) ||
      hugoVotes.getIn(['serverVotes', category]) ||
      ImmutableList(),
  }), {
    setVotes
  }
)(VoteCategory);
