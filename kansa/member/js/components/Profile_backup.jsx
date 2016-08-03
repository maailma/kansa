import { Map } from 'immutable'
import React from 'react';  
import { Link } from 'react-router'
import API from './../api.js'
import { connect } from 'react-redux';

const apiHost = 'localhost:3000';
const api = new API(`http://${apiHost}/`);
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const styles = {
  loc: { width: '162px' },
  paperPubs: { width: '162px', verticalAlign: 'top' },
  changed: { borderColor: 'rgb(255, 152, 0)' }
};
function logout(api) {
  api.GET('logout')
    .then(res => {
      window.location = '#/';
    })
    .catch(e => {
      console.error('Logout failed');
      console.log(e);
    });
}
export default class Profile extends React.Component { 
  
  static propTypes = {
    user: React.PropTypes.object.isRequired
  }
    state = {
    _sent: false
  }
  static defaultProps = {
    user: Map()
  }
  static textFields = [ 'legal_name', 'public_first_name', 'public_last_name',
                        'email', 'country', 'state', 'city' ];
 componentWillReceiveProps(props) {
  console.log("properties", props);
    const get = key => props.user.people[key];
    const state = Profile.textFields.reduce((state, key) => {
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
    this.opening = true;
  }



text = (key, style = {}) => {
    const value = this.state[key] || '';
    const prev = '';
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

  render() {

    return (
            <div>
        <ul className='user-info'>
          <li></li>
          <li><a onClick={() => logout(api)}>Logout</a></li>
        </ul>

     
     <form>
        {this.text('legal_name')}
        {this.text('email')}
        <br />
        {this.text('public_first_name')}
        {this.text('public_last_name')}
        <br />
        {this.text('city', styles.loc)}
        {this.text('state', styles.loc)}
        {this.text('country', styles.loc)}

      </form>
       </div>
      )
  }
}

export default connect(state => state)(Profile);
