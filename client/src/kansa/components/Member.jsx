import Immutable, { Map } from 'immutable'
import React from 'react'
import { Link } from 'react-router'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'

const ImmutablePropTypes = require('react-immutable-proptypes');

import { CommonFields, PaperPubsFields } from './form-components'
import Upgrade from './Upgrade'

export default class Member extends React.Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    onUpdate: React.PropTypes.func.isRequired,
    showHugoActions: React.PropTypes.bool
  }

  static defaultProps = {
    member: Map()
  }

  static fields = [ 'membership', 'legal_name', 'email', 'public_first_name', 'public_last_name',
    'country', 'state', 'city', 'paper_pubs' ];

  static membershipTypes = [ 'NonMember', 'Supporter', 'KidInTow', 'Child', 'Youth', 'FirstWorldcon', 'Adult' ];

  static emptyPaperPubsMap = Map({ name: '', address: '', country: '' });

  static paperPubsIsValid(pp) {
    return !pp || pp.get('name') && pp.get('address') && pp.get('country');
  }

  static isValid(member) {
    return Map.isMap(member)
      && member.get('legal_name', false) && member.get('email', false)
      && Member.paperPubsIsValid(member.get('paper_pubs'));
  }

  get changes() {
    const m0 = this.props.member;
    return this.state.member.filter((value, key) => {
      const v0 = m0.get(key, '');
      return Map.isMap(value) ? !value.equals(v0) : value !== v0;
    });
  }

  get valid() {
    return Member.isValid(this.state.member);
  }

  constructor(props) {
    super(props);
    this.state = {
      member: props.member,
      sent: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      member: nextProps.member,
      sent: false
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextProps.member.equals(this.props.member)) return true;
    if (nextState.sent !== this.state.sent) return true;
    if (!nextState.member.equals(this.state.member)) return true;
    return false;
  }

  render() {
    const { member, onUpdate, showHugoActions } = this.props;
    if (!member) return null;
    const membership = member.get('membership', 'NonMember');
    const formProps = {
      getDefaultValue: path => member.getIn(path) || '',
      getValue: path => this.state.member.getIn(path) || '',
      onChange: (path, value) => this.setState({ member: this.state.member.setIn(path, value) })
    };

    return <Card style={{ marginBottom: 24 }}>
      <CardHeader
        title={ membership }
        subtitle={ membership !== 'NonMember' ? '#' + member.get('member_number') : null }
      />
      <CardText>
        <CommonFields { ...formProps } />
        <br />
        <PaperPubsFields { ...formProps } />
      </CardText>
      <CardActions
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          paddingRight: 8,
          paddingBottom: 16
        }}
      >
        <RaisedButton key='ok'
          disabled={ this.state.sent || this.changes.size == 0 || !this.valid }
          label={ this.state.sent ? 'Working...' : 'Apply changes' }
          onTouchTap={ () => {
            this.setState({ sent: true });
            console.log('updating', member, onUpdate);
            onUpdate(member.get('id'), this.changes);
          }}
          style={{ flexShrink: 0 }}
        />
        <Upgrade
          member={member}
          style={{ marginRight: 8 }}
        >
          <RaisedButton label='Upgrade' />
        </Upgrade>
        { showHugoActions ? <Link
          style={{ flexGrow: 1, marginLeft: 8 }}
          to={`/hugo/${member.get('id')}/nominate`}
        >Nominate for the Hugo Awards</Link> : null }
      </CardActions>
    </Card>;
  }
}
