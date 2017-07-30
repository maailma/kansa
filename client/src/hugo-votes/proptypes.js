import { PropTypes } from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'

import { categories } from './constants'

export const finalist = ImmutablePropTypes.mapContains({
  id: PropTypes.number.isRequired,
  'no-award': PropTypes.bool,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
})

export const categoryFinalists = ImmutablePropTypes.mapOf(
  finalist,
  PropTypes.number
);

export const finalists = ImmutablePropTypes.mapOf(
  categoryFinalists,
  PropTypes.oneOf(categories)
);

export const categoryVotes = ImmutablePropTypes.listOf(PropTypes.number);

export const votes = ImmutablePropTypes.mapOf(
  categoryVotes,
  PropTypes.oneOf(categories)
);

export const hugoVotes = ImmutablePropTypes.mapContains({
  clientVotes: votes.isRequired,
  finalists: finalists.isRequired,
  id: PropTypes.number,
  isSaving: PropTypes.bool,
  serverTime: PropTypes.instanceOf(Date),
  serverVotes: votes.isRequired,
  signature: PropTypes.string
});

export const packetFormat = ImmutablePropTypes.mapContains({
  label: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
})

export const categoryPacket = ImmutablePropTypes.mapContains({
  epub: packetFormat,
  mobi: packetFormat,
  pdf: packetFormat
})

export const packet = ImmutablePropTypes.mapOf(
  categoryPacket,
  PropTypes.oneOf(categories)
)
