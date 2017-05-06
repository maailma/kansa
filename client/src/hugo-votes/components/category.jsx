import { List as ImmutableList, Map as ImmutableMap } from 'immutable'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
const { Col, Row } = require('react-flexbox-grid')

import time_diff from '../../lib/time_diff'
import { categoryInfo, nominationFields } from '../../hugo-nominations/constants'
import { setPacketFormat, setVotes } from '../actions'
import { categories } from '../constants'
import * as VotePropTypes from '../proptypes'

import CategoryList from './category-list'
import Packet from './packet'

class VoteCategory extends React.Component {
  static propTypes = {
    category: PropTypes.oneOf(categories),
    finalists: VotePropTypes.categoryFinalists,
    packetFormat: PropTypes.string,
    preference: VotePropTypes.categoryVotes,
    setPacketFormat: PropTypes.func.isRequired,
    setVotes: PropTypes.func.isRequired
  }

  render() {
    const { category, finalists, packetFormat, preference, setPacketFormat, setVotes } = this.props
    const { title } = categoryInfo[category]
    return <Card className='body-card'>
      <CardHeader
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          paddingBottom: 0
        }}
        textStyle={{
          display: 'block',
          padding: 0
        }}
        title={title}
        titleStyle={{
          fontSize: 24,
          fontWeight: 400,
          textAlign: 'left'
        }}
      >
        <Packet
          epub={ImmutableMap({ label: 'EPUB, 3MB', url: '/packet/epub.zip' })}
          pdf={ImmutableMap({ label: 'PDF, 5MB', url: '/packet/pdf.zip' })}
          format={packetFormat}
          onSelectFormat={setPacketFormat}
        />
      </CardHeader>
      <CardText>
        <CategoryList
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
    packetFormat: hugoVotes.get('packetFormat'),
    preference: hugoVotes.getIn(['clientVotes',category]) ||
      hugoVotes.getIn(['serverVotes', category]) ||
      ImmutableList(),
  }), {
    setPacketFormat,
    setVotes
  }
)(VoteCategory)
