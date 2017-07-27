import { Map } from 'immutable'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import { CommonFields, PaperPubsFields } from './form';
import TokenSelector from './TokenSelector'

const styles = {
  noVote: { color: 'black', fontWeight: 'bold', paddingTop: 20, textAlign: 'right' }
}

export default class Voter extends React.Component {
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
    onClose: PropTypes.func.isRequired
  }

  static voterTypes = ['Supporter', 'Youth', 'FirstWorldcon', 'Adult']

  static get defaultState () {
    return {
      available_tokens: [],
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
          console.error(err)
          window.alert('Token lookup failed! ' + err.message)
        })
    }
  }

  vote = () => {
    const { api, member, onClose } = this.props
    const { token, voter_name, voter_email } = this.state
    this.setState({ sent: true })
    api.POST(`siteselect/voters/${member.get('id')}`, {
      token: token ? token.token : null,
      voter_name: voter_name.trim() || member.get('legal_name'),
      voter_email: voter_email.trim() || member.get('email')
    })
      .then(onClose)
      .catch(err => {
        console.error(err)
        this.setState({ sent: false })
        window.alert('Vote failed! ' + err.message)
      })
  }

  render () {
    const { api, member, onClose } = this.props
    const { available_tokens, sent, token, voter_email, voter_name } = this.state
    const {
      legal_name, preferred_name, badge_name,
      email, membership, member_number,
      country, state, city
    } = member ? member.toJS() : {}
    const location = [country, state, city].filter(v => v).join(', ')
    return (
      <Dialog
        actions={[
          <FlatButton key='close' label='Close' onTouchTap={onClose} />,
          <FlatButton key='ok'
            label={sent ? 'Working...' : 'Vote'}
            disabled={sent || !this.isVoter || !!(token && (!token.token || token.used))}
            onTouchTap={this.vote}
          />
        ]}
        autoScrollBodyContent={true}
        className='voter'
        onRequestClose={onClose}
        open={!!member}
        title={this.isVoter ? `Member #${member_number} (${membership})` : `Non-voter (${membership})`}
      >
        <TextField
          floatingLabelText='Voter name'
          floatingLabelFixed={true}
          fullWidth={true}
          hintText={legal_name}
          name='name'
          onChange={(_, voter_name) => this.setState({ voter_name })}
          value={voter_name}
        />
        <TextField
          floatingLabelText='Voter email'
          floatingLabelFixed={true}
          fullWidth={true}
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
