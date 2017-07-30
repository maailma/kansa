export const getFinalists = () => ({
  module: 'hugo-votes',
  type: 'GET_FINALISTS'
})

export const getHugoPacketSeriesExtra = () => ({
  module: 'hugo-votes',
  type: 'GET_HUGO_PACKET_SERIES_EXTRA'
})

export const getVotes = () => ({
  module: 'hugo-votes',
  type: 'GET_VOTES'
})

export const setPacket = (packet) => ({
  module: 'hugo-votes',
  type: 'SET_PACKET',
  packet
})

export const setServerData = (votes, time) => ({
  module: 'hugo-votes',
  type: 'SET_SERVER_DATA',
  time,
  votes
})

export const setVoter = (id, signature) => ({
  module: 'hugo-votes',
  type: 'SET_VOTER',
  id,
  signature
})

export const setVotes = (votes) => ({
  module: 'hugo-votes',
  type: 'SET_VOTES',
  votes
})

export const submitVotes = () => ({
  module: 'hugo-votes',
  type: 'SUBMIT_VOTES'
})
