import Immutable, { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { routerShape, withRouter } from 'react-router'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

const ImmutablePropTypes = require('react-immutable-proptypes');

import { logout, memberUpdate } from '../actions'
import { PATH_OUT } from '../constants'

import { CommonFields, PaperPubsFields } from './form'
import Upgrade from './Upgrade'

class Member extends React.Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    onLogout: React.PropTypes.func.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
    router: routerShape.isRequired
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
    const { member, router } = nextProps;
    if (!Map.isMap(member) || member.isEmpty()) router.replace(PATH_OUT);
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
    const { member, onLogout, onUpdate } = this.props;
    if (!member) return null;
    const membership = member.get('membership', 'NonMember');
    const formProps = {
      getDefaultValue: path => member.getIn(path) || '',
      getValue: path => this.state.member.getIn(path) || '',
      onChange: (path, value) => this.setState({ member: this.state.member.setIn(path, value) })
    };

    return <div>
      <ul className='user-info'>
        <li></li>
        <li><a onClick={onLogout}>Logout</a></li>
      </ul>
      <div className="container">
        <CommonFields { ...formProps } />
        <br />
        <PaperPubsFields { ...formProps } />
        <FlatButton key='ok'
          label={ this.state.sent ? 'Working...' : 'Apply' }
          disabled={ this.state.sent || this.changes.size == 0 || !this.valid }
          onTouchTap={ () => {
            this.setState({ sent: true });
            onUpdate(member.get('id'), this.changes);
          }}
        />
      </div>
    </div>;
  }
}

export default connect(
  (state) => ({
    member: state.user.get('member')
  }), {
    onLogout: logout,
    onUpdate: memberUpdate
  }
)(
  withRouter(Member)
);
