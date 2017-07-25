import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const ImmutablePropTypes = require('react-immutable-proptypes');

import { CommonFields, PaperPubsFields } from './form';
import MemberLog from './MemberLog';
import NewInvoice from './NewInvoice';
import Upgrade from './Upgrade';

const fullLocation = (person) => ['country', 'state', 'city']
  .map(k => person.get(k))
  .filter(v => !!v)
  .join(', ');

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

  get validToken () {
    const { token } = this.state
    return token && token.token && !token.used
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
    api.POST('siteselect/vote', {
      person_id: member.get('id'),
      token: token.token,
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
    const { sent, token } = this.state
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
            disabled={sent || !this.isVoter || !this.validToken}
            onTouchTap={this.vote}
          />
        ]}
        autoScrollBodyContent={true}
        onRequestClose={onClose}
        open={!!member}
        title={this.isVoter ? `Member #${member_number} (${membership})` : `Non-voter (${membership})`}
      >
        <dl>
          <dt>Name</dt><dd>{legal_name}</dd>
          {preferred_name && preferred_name !== legal_name ? [
            <dt key='pt'>Public name</dt>, <dd key='pn'>{preferred_name}</dd>
          ] : null}
          {badge_name && badge_name !== preferred_name ? [
            <dt key='bt'>Badge name</dt>, <dd key='bn'>{badge_name}</dd>
          ] : null}
          <dt>Email</dt><dd>{email}</dd>
          {location ? [<dt key='lt'>Location</dt>, <dd key='ll'>{location}</dd>] : null}
          <hr />
          <dt>Token</dt><dd>{token && token.token}</dd>
        </dl>
      </Dialog>
    )
  }
}
