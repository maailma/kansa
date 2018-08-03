import { showMessage } from '../app/actions/app'
import { getVotes, setPacket, setServerData, submitVotes } from './actions'
import { API_ROOT } from '../constants'
import api from '../lib/api'

const submitDelay = 15 * 1000
let submitTimeout = null
let submitBeforeUnload = null

function handleReceiveVotes (dispatch, data) {
  let latestTime = null
  const allVotes = Object.keys(data).reduce((allVotes, category) => {
    const { time, votes } = data[category]
    if (!latestTime || time > latestTime) latestTime = time
    allVotes[category] = votes
    return allVotes
  }, {})
  dispatch(setServerData(allVotes, latestTime))
}

function handleSubmitVotes (dispatch, { hugoVotes }, atUnload) {
  const id = hugoVotes.get('id')
  const signature = hugoVotes.get('signature')
  if (!id || !signature) {
    return dispatch({ type: 'ERROR', error: new Error('Voting requires id & signature!') })
  }
  const votes = hugoVotes.get('clientVotes').filter((catVotes, category) => (
    catVotes && !catVotes.equals(hugoVotes.getIn(['serverVotes', category]))
  ))
  if (votes.size) {
    const lastmod = hugoVotes.get('serverTime')
    const data = { lastmod, signature, votes: votes.toJS() }
    const path = `hugo/${id}/vote`
    if (atUnload) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API_ROOT + path, blob)
      } else {  // IE, Safari
        const xhr = new XMLHttpRequest()
        xhr.open('POST', API_ROOT + path, false)
        xhr.send(blob)
      }
    } else {
      api.POST(path, data)
        .then(({ time }) => {
          dispatch(setServerData(votes, time))
          if (window.ga) votes.forEach((_, category) => ga('send', 'event', 'Vote', category))
        })
        .catch(error => dispatch(error.message === 'Client has stale data'
          ? getVotes()
          : { type: 'ERROR', error }
        ))
    }
  }
}

export default ({ dispatch, getState }) => (next) => (action) => {
  if (action.error || action.module !== 'hugo-votes') return next(action)
  try {
    switch (action.type) {
      case 'GET_FINALISTS': {
        const finalists = getState().hugoVotes.get('finalists')
        if (!finalists || finalists.size === 0) {
          api.GET('hugo/finalists')
        .then(finalists => next({ ...action, finalists }))
        }
        return
      }

      case 'GET_HUGO_PACKET_SERIES_EXTRA': {
        const id = getState().hugoVotes.get('id')
        if (!id) return dispatch({ type: 'ERROR', error: new Error('Voter id not set!') })
        api.GET(`hugo/${id}/packet-series-extra`)
        .then(() => dispatch(showMessage('Token requested, will be sent by email.')))
        return
      }

      case 'GET_VOTES':
        const id = getState().hugoVotes.get('id')
        if (!id) return dispatch({ type: 'ERROR', error: new Error('Voter id not set!') })
        api.GET(`hugo/${id}/votes`)
        .then(data => {
          handleReceiveVotes(dispatch, data)
          dispatch(showMessage('Client votes have been refreshed from the server'))
        })
        break

      case 'SET_VOTER':
        if (action.id && action.signature) {
          api.GET(`hugo/${action.id}/votes`)
          .then(data => handleReceiveVotes(dispatch, data))
          api.GET(`hugo/${action.id}/packet`)
          .then(packet => dispatch(setPacket(packet)))
        } else {
          dispatch(setPacket(null))
        }
        break

      case 'SET_VOTES':
        if (submitTimeout) clearTimeout(submitTimeout)
        submitTimeout = setTimeout(() => dispatch(submitVotes()), submitDelay)
        if (!submitBeforeUnload) {
          submitBeforeUnload = () => handleSubmitVotes(() => {}, getState(), true)
          window.addEventListener('beforeunload', submitBeforeUnload)
        }
        break

      case 'SUBMIT_VOTES':
        if (submitTimeout) {
          clearTimeout(submitTimeout)
          submitTimeout = null
        }
        handleSubmitVotes(dispatch, getState())
        break
    }
  } catch (error) {
    return next({ ...action, error })
  }

  next(action)
}
