import { Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

import TokenSelector from './TokenSelector'

const styles = {
  noVote: { color: 'black', fontWeight: 'bold', paddingTop: 20, textAlign: 'right' }
}

class Voter extends Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    member: ImmutablePropTypes.mapContains({
      id: PropTypes.number.isRequired,
      legal_name: PropTypes.string.isRequired,
      email: PropTypes.string,
      badge_name: PropTypes.string,
      membership: PropTypes.string,
      preferred_name: PropTypes.string,
      country: PropTypes.string,
      state: PropTypes.string,
      city: PropTypes.string
    }),
    onClose: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
  }

  static voterTypes = ['Supporter', 'Youth', 'FirstWorldcon', 'Adult']

  static get defaultState () {
    return {
      available_tokens: [],
      past_names: [],
      sent: false,
      token: null,
      voter_name: '',
      voter_email: ''
    }
  }

  state = Voter.defaultState

  get isVoter () {
    const { member } = this.props
    return Map.isMap(member) &&
      Voter.voterTypes.indexOf(member.get('membership')) !== -1
  }

  componentWillReceiveProps ({ api, member }) {
    if (member && !member.equals(this.props.member)) {
      this.setState(Voter.defaultState)
      api.GET(`siteselect/voters/${member.get('id')}`)
        .then(tokens => this.setState({
          available_tokens: tokens,
          token: tokens.find(t => t.used) || tokens[0]
        }))
        .catch(err => {
          console.error('Token lookup failed!', err)
          window.alert('Token lookup failed! ' + err.message)
        })
      api.GET(`people/${member.get('id')}/prev-names`)
        .then(past_names => this.setState({ past_names }))
        .catch(err => {
          console.error('Past name lookup failed!', err)
        })
    }
  }

  vote = () => {
    const { api, member, onClose, showMessage } = this.props
    const { token } = this.state
    const voter_name = this.state.voter_name.trim() || member.get('legal_name')
    const voter_email = this.state.voter_email.trim() || member.get('email')
    this.setState({ sent: true })
    api.POST(`siteselect/voters/${member.get('id')}`, {
      token: token ? token.token : null,
      voter_name,
      voter_email
    })
      .then(() => showMessage(`Vote registered for ${voter_name}`))
      .then(onClose)
      .catch(err => {
        console.error(err)
        this.setState({ sent: false })
        window.alert('Vote failed! ' + err.message)
      })
  }

  renderPastNames = () => this.state.past_names.map(({ prev_legal_name, time_from, time_to }, i) => {
    const t0 = time_from ? new Date(time_from).toISOString().substr(0, 10) : '???'
    const t1 = time_to ? new Date(time_to).toISOString().substr(0, 10) : '???'
    return <p key={i}>Previous name: <b>{prev_legal_name}</b> ({t0} - {t1})</p>
  })

  render () {
    const { api, member, onClose } = this.props
    const { available_tokens, sent, token, voter_email, voter_name } = this.state
    const { legal_name, email, membership, member_number } = member ? member.toJS() : {}
    return (
      <Dialog
        actions={[
          <FlatButton key='close' label='Close' onClick={onClose} />,
          <FlatButton key='ok'
            label={sent ? 'Working...' : 'Vote'}
            disabled={sent || !this.isVoter || !!(token && (!token.token || token.used))}
            onClick={this.vote}
          />
        ]}
        autoScrollBodyContent
        className='voter'
        onRequestClose={onClose}
        open={!!member}
        title={this.isVoter ? `Member #${member_number} (${membership})` : `Non-voter (${membership})`}
      >
        {this.renderPastNames()}
        <TextField
          floatingLabelText='Voter name'
          floatingLabelFixed
          fullWidth
          hintText={legal_name}
          name='name'
          onChange={(_, voter_name) => this.setState({ voter_name })}
          value={voter_name}
        />
        <TextField
          floatingLabelText='Voter email'
          floatingLabelFixed
          fullWidth
          hintText={email}
          name='email'
          onChange={(_, voter_email) => this.setState({ voter_email })}
          value={voter_email}
        />
        {token && token.used ? (
          <div style={styles.noVote}>Voted at {token.used}</div>
        ) : !this.isVoter ? (
          <div style={styles.noVote}>Not eligible to vote</div>
        ) : (
          <TokenSelector
            api={api}
            onAdd={(token) => this.setState({
              available_tokens: [token].concat(this.state.available_tokens),
              token
            })}
            onSelect={(token) => this.setState({ token })}
            selected={token || null}
            tokens={available_tokens}
          />
        )}
      </Dialog>
    )
  }
}

export default connect(
  null, (dispatch) => ({
    showMessage: (message) => dispatch({ type: 'SET MESSAGE', message })
  })
)(Voter)
