import { Map } from 'immutable'
import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const ImmutablePropTypes = require('react-immutable-proptypes');

import MemberForm from './MemberForm';
import MemberLog from './MemberLog';
import MemberUpgrade from './MemberUpgrade';

export default class MemberDetails extends React.Component {
  static propTypes = {
    open: React.PropTypes.bool.isRequired,
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

  static membershipTypes = [ 'NonMember', 'Supporter', 'KidInTow', 'Child', 'Youth', 'FirstWorldcon', 'Adult' ];

  static emptyPaperPubsMap = Map({ name: '', address: '', country: '' });

  static paperPubsIsValid(pp) {
    return !pp || pp.get('name') && pp.get('address') && pp.get('country');
  }

  static isValid(member) {
    return Map.isMap(member)
      && member.get('legal_name', false) && member.get('email', false)
      && MemberDetails.paperPubsIsValid(member.get('paper_pubs'));
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
    return MemberDetails.isValid(this.state.member);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.member.equals(this.props.member)) {
      this.setState({
        member: MemberDetails.defaultProps.member.merge(nextProps.member),
        sent: false
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.open !== this.props.open) return true;
    if (nextProps.api !== this.props.api) return true;
    if (nextProps.handleClose !== this.props.handleClose) return true;
    if (!nextProps.member.equals(this.props.member)) return true;
    if (nextState.sent !== this.state.sent) return true;
    if (!nextState.member.equals(this.state.member)) return true;
    return false;
  }

  render() {
    const { open, api, handleClose, member } = this.props;
    const membership = member.get('membership', 'NonMember');
    return (<Dialog
      actions={[
        <MemberLog key='log' style={{ float: 'left' }}
          getLog={ id => id > 0 ? api.GET(`people/${id}/log`) : Promise.reject('Invalid id! ' + id) }
          id={member.get('id', -1)}
        />,
        <MemberUpgrade key='upgrade' style={{ float: 'left' }}
          membership={membership}
          paper_pubs={member.get('paper_pubs')}
          name={ member.get('legal_name') + ' <' + member.get('email') + '>' }
          upgrade={ res => api.POST(`people/${member.get('id')}/upgrade`, res) }
        />,
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
      open={open}
      title={ membership == 'NonMember' ? 'Non-member' : `Member #${member.get('member_number')} (${membership})` }
      autoScrollBodyContent={true}
      bodyClassName='memberDialog'
      onRequestClose={handleClose}
    >
      <MemberForm
        getDefaultValue={ path => member.getIn(path, '') }
        getValue={ path => this.state.member.getIn(path, null) }
        onChange={ (path, value) => this.setState({ member: this.state.member.setIn(path, value) }) }
      />
    </Dialog>);
  }
}
