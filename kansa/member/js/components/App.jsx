import { Map } from 'immutable';
import React from 'react';  
import { Link } from 'react-router';
import { connect } from 'react-redux';
import API from '../api.js';

export default class App extends React.Component { 

  static propTypes = {
    api: React.PropTypes.instanceOf(API).isRequired,
    user: React.PropTypes.instanceOf(Map).isRequired
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.user.get("member")) {
      this.redirectToProfile();
    }
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }

  handleKeyChange(e) {
    this.setState({key: e.target.value});
  }

  handleLogin() {
    this.props.api.GET('login',{email:this.state.email,key:this.state.key})
      .then(location.reload());
  }

  getKey() {
    this.props.api.POST('key', {email : this.state.email})
      .then(function(response) { })
      .catch(e => console.log(e));
  }

  redirectToProfile() {
    window.location = '#/profile/';
  }

  validateLogin() {
    if(this.state == null || this.state.email =="" || this.state.key =="") {
      msg = "Please fill out all fields";
      return false;
    }  
    return true;
  }

  render() {
    const { user } = this.props;

    return <div>
      <hgroup>
        <h1>WORLDCON 75 LOGIN</h1>
      </hgroup>
      <form>
        <div className="group">
          <input type="text" name="email" id="email" onChange={this.handleEmailChange.bind(this)}/>
          <span className="highlight"></span><span className="bar"></span>
          <label>Email</label>
        </div>
        <div className="group">
          <input type="text" name="key" id="key" onChange={this.handleKeyChange.bind(this)} />
          <span className="highlight"></span><span className="bar"></span>
          <label>Key</label>
        </div>
        <button type="button" className="button buttonBlue" onClick={this.handleLogin.bind(this)}>
          Login
          <div className="ripples buttonRipples"><span className="ripplesCircle"></span></div>
        </button>
        <button type="button" className="button buttonBlue" onClick={this.getKey.bind(this)}>
          Get login key
          <div className="ripples buttonRipples"><span className="ripplesCircle"></span></div>
        </button>
      </form>
    </div>
  }
}

export default connect(state => state)(App);
