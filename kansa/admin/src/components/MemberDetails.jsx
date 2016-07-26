import { Map } from 'immutable'
import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import MemberUpgrade from './MemberUpgrade';

const styles = {
  loc: { width: '162px' },
  paperPubs: { width: '162px', verticalAlign: 'top' },
  changed: { borderColor: 'rgb(255, 152, 0)' }
};

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

  state = {
    _sent: false
  }

  componentWillReceiveProps(props) {
    const get = props.open ? key => props.member.get(key, '') : () => '';
    const state = MemberDetails.textFields.reduce((state, key) => {
      state[key] = get(key);
      return state;
    }, { _sent: false });
    const pp0 = get('paper_pubs');
    if (pp0) {
      state.pp_name = pp0.get('name', '');
      state.pp_address = pp0.get('address', '');
      state.pp_country = pp0.get('country', '');
    }
    this.setState(state);
    this.opening = props.open;
  }

  text = (key, style = {}) => {
    const value = this.state[key] || '';
    const prev = this.props.member.get(key) || '';
    const ulStyle = value == prev ? {} : styles.changed;
    return <TextField
      floatingLabelText={ key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ') }
      floatingLabelFixed={true}
      className='memberInput'
      style={style}
      value={value}
      onChange={ ev => this.setState({ [key]: ev.target.value }) }
      underlineStyle={ulStyle}
      underlineFocusStyle={ulStyle}
    />;
  }

  ppText = (key) => {
    const ppKey = `pp_${key}`;
    const value = this.state[ppKey] || '';
    const prev = this.props.member.getIn([ 'paper_pubs', key ]) || '';
    const ulStyle = value == prev ? {} : styles.changed;
    return <TextField
      floatingLabelText={`Paper pubs ${key}`}
      floatingLabelFixed={true}
      className='memberInput'
      multiLine={ key === 'address' }
      style={styles.paperPubs}
      value={value}
      errorText={ value ? '' : 'Required' }
      onChange={ ev => this.setState({ [ppKey]: ev.target.value }) }
      underlineStyle={ulStyle}
      underlineFocusStyle={ulStyle}
    />;
  }

  get ppState() {
    return this.props.member.get('paper_pubs') ? {
      name: this.state.pp_name,
      address: this.state.pp_address,
      country: this.state.pp_country
    } : null;
  }

  get ppStateChanged() {
    const pp0 = this.props.member.get('paper_pubs');
    return pp0 && ( pp0.get('name') != this.state.pp_name ||
                    pp0.get('address') != this.state.pp_address ||
                    pp0.get('country') != this.state.pp_country );
  }

  get ppValid() {
    const pp0 = this.props.member.get('paper_pubs');
    return !pp0 || this.state.pp_name && this.state.pp_address && this.state.pp_country;
  }

  render() {
    const { open, api, handleClose, member } = this.props;
    const membership = member.get('membership', 'NonMember');
    const update = MemberDetails.textFields.reduce((update, key) => {
      const v0 = member.get(key, '');
      const v1 = this.state[key];
      if (v0 != v1) update[key] = v1;
      return update;
    }, {});
    if (this.ppStateChanged) update.paper_pubs = this.ppState;
    return (<Dialog
      actions={[
        <MemberUpgrade key='upgrade' style={{ float: 'left' }}
          hasPaperPubs={ !!member.get('paper_pubs') }
          membership={membership}
          name={ member.get('legal_name') + ' <' + member.get('email') + '>' }
          upgrade={ res => api.POST(`people/${member.get('id')}/upgrade`, res) }
        />,
        <FlatButton key='cancel' label='Cancel' onTouchTap={handleClose} />,
        <FlatButton key='ok'
          label={ this.state._sent ? 'Working...' : 'Apply' }
          disabled={ this.state._sent || Object.keys(update).length == 0 || !this.ppValid }
          onTouchTap={() => {
            this.setState({ _sent: true });
            api.POST(`people/${member.get('id')}`, update)
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
        {this.text('city', styles.loc)}
        {this.text('state', styles.loc)}
        {this.text('country', styles.loc)}
        <br />
        {this.ppText('name')}
        {this.ppText('address')}
        {this.ppText('country')}
      </form>
    </Dialog>);
  }
}
