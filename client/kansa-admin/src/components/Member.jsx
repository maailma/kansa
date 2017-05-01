import { Map } from 'immutable'
import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const ImmutablePropTypes = require('react-immutable-proptypes');

import { CommonFields, PaperPubsFields } from './form';
import MemberLog from './MemberLog';
import Upgrade from './Upgrade';

export default class Member extends React.Component {
  static propTypes = {
    api: React.PropTypes.object.isRequired,
    handleClose: React.PropTypes.func.isRequired,
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
    if (nextProps.member && (!this.props.member || !nextProps.member.equals(this.props.member))) {
      this.setState({
        member: Member.defaultProps.member.merge(nextProps.member),
        sent: false
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.api !== this.props.api) return true;
    if (nextProps.handleClose !== this.props.handleClose) return true;
    if (!nextProps.member.equals(this.props.member)) return true;
    if (nextState.sent !== this.state.sent) return true;
    if (!nextState.member.equals(this.state.member)) return true;
    return false;
  }

  render() {
    const { api, handleClose, member } = this.props;
    if (!member) return null;
    const membership = member.get('membership', 'NonMember');
    const formProps = {
      getDefaultValue: path => member.getIn(path, ''),
      getValue: path => this.state.member.getIn(path, null),
      onChange: (path, value) => this.setState({ member: this.state.member.setIn(path, value) })
    };

    return <Dialog
      actions={[
        <MemberLog key='log'
          getLog={ id => id > 0 ? api.GET(`people/${id}/log`) : Promise.reject('Invalid id! ' + id) }
          id={member.get('id', -1)}
        >
          <FlatButton label='View log' style={{ float: 'left' }} />
        </MemberLog>,

        <Upgrade key='upgrade'
          membership={membership}
          paper_pubs={member.get('paper_pubs')}
          name={ member.get('legal_name') + ' <' + member.get('email') + '>' }
          upgrade={ res => api.POST(`people/${member.get('id')}/upgrade`, res) }
        >
          <FlatButton label='Upgrade' style={{ float: 'left' }} />
        </Upgrade>,

        <FlatButton key='close' label='Close' onTouchTap={handleClose} />,

        <FlatButton key='ok'
          label={ this.state.sent ? 'Working...' : 'Apply' }
          disabled={ this.state.sent || this.changes.size == 0 || !this.valid }
          onTouchTap={() => {
            this.setState({ sent: true });
            api.POST(`people/${member.get('id')}`, this.changes.toJS())
              .then(handleClose)
              .catch(e => console.error(e));  // TODO: report errors better
          }} />
      ]}
      title={<div title={'ID: ' + member.get('id')}>
        <div style={{
          color: 'rgba(0, 0, 0, 0.3)',
          float: 'right',
          fontSize: 11,
          fontStyle: 'italic',
          lineHeight: 'normal',
          textAlign: 'right'
        }}>
          Last modified<br />
          { member.get('last_modified') }
        </div>
        { membership == 'NonMember' ? 'Non-member' : `Member #${member.get('member_number')} (${membership})` }
      </div>}
      open={true}
      autoScrollBodyContent={true}
      bodyClassName='memberDialog'
      onRequestClose={handleClose}
    >
      <CommonFields { ...formProps } />
      <br />
      <PaperPubsFields { ...formProps } />
    </Dialog>;
  }
}
