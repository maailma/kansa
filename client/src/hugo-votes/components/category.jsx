import { List as ImmutableList, Map as ImmutableMap } from 'immutable'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import { categoryInfo } from '../../hugo-nominations/constants'
import { setVotes } from '../actions'
import { categories } from '../constants'
import * as VotePropTypes from '../proptypes'

import CategoryList from './category-list'
import Packet from './packet'

const VoteCategory = ({ category, finalists, packet, preference, setVotes }) => (
  <Card className='body-card'>
    <CardHeader
      style={{
        alignItems: 'flex-start',
        display: 'flex',
        flexWrap: 'wrap',
        paddingBottom: 0
      }}
      textStyle={{
        display: 'block',
        padding: 0
      }}
      title={categoryInfo[category]}
      titleStyle={{
        fontSize: 24,
        fontWeight: 400,
        textAlign: 'left'
      }}
    >
      <Packet category={category} formats={packet} />
    </CardHeader>
    <CardText>
      <CategoryList
        finalists={finalists}
        preference={preference}
        setPreference={(preference) => {
          setVotes(ImmutableMap([[category, preference]]))
        }}
      />
    </CardText>
  </Card>
)

VoteCategory.propTypes = {
  category: PropTypes.oneOf(categories),
  finalists: VotePropTypes.categoryFinalists.isRequired,
  packet: VotePropTypes.categoryPacket.isRequired,
  preference: VotePropTypes.categoryVotes.isRequired,
  setVotes: PropTypes.func.isRequired
}

export default connect(
  ({ hugoVotes }, { category }) => ({
    finalists: hugoVotes.getIn(['finalists', category]) || ImmutableMap(),
    packet: hugoVotes.getIn(['packet', category]) || ImmutableMap(),
    preference: hugoVotes.getIn(['clientVotes', category]) ||
      hugoVotes.getIn(['serverVotes', category]) ||
      ImmutableList()
  }), {
    setVotes
  }
)(VoteCategory)
