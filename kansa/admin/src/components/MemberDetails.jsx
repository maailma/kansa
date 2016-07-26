import { Map } from 'immutable'
import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import Membership from './Membership';

const narrow = { width: '162px' };

export default class MemberDetails extends React.Component {
  static propTypes = {
    open: React.PropTypes.bool.isRequired,
    api: React.PropTypes.object.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    member: React.PropTypes.instanceOf(Map)
  }

  static defaultProps = {
    member: Map()
  }

  static textFields = [ 'legal_name', 'public_first_name', 'public_last_name',
                        'email', 'country', 'state', 'city' ];

  state = {}

  componentWillReceiveProps(props) {
    const get = props.open ? key => props.member.get(key, '') : () => '';
    this.setState(MemberDetails.textFields.reduce((state, key) => {
      state[key] = get(key);
      return state;
    }, {}));
    this.opening = props.open;
  }

  text = (key, style = {}) => (<TextField
    id={key} name={key}
    floatingLabelText={ key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ') }
    floatingLabelFixed={true}
    className='memberInput'
    style={style}
    value={this.state[key] || ''}
    onChange={ ev => this.setState({ [key]: ev.target.value }) }
  />);

  render() {
    const { open, api, handleClose, member } = this.props;
    const membership = member.get('membership', 'NonMember');
    const update = MemberDetails.textFields.reduce((update, key) => {
      const v0 = member.get(key, '');
      const v1 = this.state[key];
      if (v0 != v1) update[key] = v1;
      return update;
    }, {});
    return (<Dialog
      key='dialog'
      actions={[
        <Membership key='upgrade' style={{ float: 'left' }}
          membership={membership}
          name={ member.get('legal_name') + ' <' + member.get('email') + '>' }
          upgrade={ ({ membership, comment }) => api.POST(`people/${member.get('id')}/upgrade`, { membership, comment }) }
        />,
        <FlatButton key='cancel' label='Cancel' onTouchTap={handleClose} />,
        <FlatButton key='ok' label='Apply'
          disabled={ Object.keys(update).length == 0 }
          onTouchTap={() => {
            api.POST(`people/${member.get('id')}`, update)
              .then(handleClose)
              .catch(e => console.error(e));  // TODO: report errors better
          }} />
      ]}
      modal={false}
      open={open}
      title={ membership == 'NonMember' ? 'Non-member' : `Member #${member.get('member_number')} (${membership})` }
      autoScrollBodyContent={true}
      bodyClassName='memberDialog'
      onRequestClose={handleClose}
    >
      <form ref={ ref => { if (ref && this.opening) {
        this.opening = false;
        ref.querySelector('input').focus();
      }}}>
        {this.text('legal_name')}
        {this.text('email')}
        <br />
        {this.text('public_first_name')}
        {this.text('public_last_name')}
        <br />
        {this.text('country', narrow)}
        {this.text('state', narrow)}
        {this.text('city', narrow)}
      </form>
    </Dialog>);
  }
}
