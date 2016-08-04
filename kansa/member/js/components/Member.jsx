import { Map } from 'immutable'
import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import API from './../api.js'
import { connect } from 'react-redux';


const apiHost = 'localhost:3000';
const api = new API(`http://${apiHost}/`);

const ImmutablePropTypes = require('react-immutable-proptypes');

import { CommonFields, PaperPubsFields } from './form';
import Upgrade from './Upgrade';

function logout(api) {
  api.GET('logout')
    .then(res => {
      window.location = '#/';
    })
    .catch(e => {
      console.error('Logout failed');
    });
}
export default class Member extends React.Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      legal_name: React.PropTypes.string,
      email: React.PropTypes.string,
      public_first_name: React.PropTypes.string,
      public_last_name: React.PropTypes.string,
      country: React.PropTypes.string,
      state: React.PropTypes.string,
      city: React.PropTypes.string,
      paper_pubs: ImmutablePropTypes.mapContains({
        name: React.PropTypes.string.isRequired,
        address: React.PropTypes.string.isRequired,
        country: React.PropTypes.string.isRequired
      })
    })
  }

  static defaultProps = {
    member: Map({
      legal_name: '',
      email: '',
      public_first_name: '',
      public_last_name: '',
      country: '',
      state: '',
      city: ''
    })
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

  state = {
    member: Map(),
    sent: false
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

  componentWillReceiveProps(nextProps) {

console.log("nextProps",nextProps)





      this.setState({
        member: Member.defaultProps.member.merge(nextProps.user.get("member")[0]),
        sent: false
      });
    
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextProps.member.equals(this.props.user.get("member")[0])) return true;
    if (nextState.sent !== this.state.sent) return true;
    if (!nextState.member.equals(this.state.member)) return true;
    return false;
  }

  render() {
    const { member } = this.props;
    if (!member) return null;
    const membership = member.get('membership', 'NonMember');
    const formProps = {
      getDefaultValue: path => member.getIn(path, ''),
      getValue: path => this.state.member.getIn(path, null),
      onChange: (path, value) => this.setState({ member: this.state.member.setIn(path, value) })
    };

    return <div>
            <ul className='user-info'>
          <li></li>
          <li><a onClick={() => logout(api)}>Logout</a></li>
        </ul>
              <div className="container">

      <CommonFields { ...formProps } />
      <br />
      <PaperPubsFields { ...formProps } />
              <Upgrade key='upgrade'
          membership={membership}
          paper_pubs={member.get('paper_pubs')}
          name={ member.get('legal_name') + ' <' + member.get('email') + '>' }
          upgrade={ res => api.POST(`people/${member.get('id')}/upgrade`, res) }
        >
          <FlatButton className="buttonBlue" label='Upgrade' style={{ float: 'left' }} />
        </Upgrade>
        <FlatButton key='ok'
          label={ this.state.sent ? 'Working...' : 'Apply' }
          disabled={ this.state.sent || this.changes.size == 0 || !this.valid }
          onTouchTap={() => {
            this.setState({ sent: true });
            api.POST(`people/${this.state.member.get('id')}`, this.changes.toJS())
              .catch(e => console.error(e));  // TODO: report errors better
          }} />
          </div>
    </div>;
  }
}
export default connect(state => state)(Member);