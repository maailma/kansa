import React from 'react';  
import { Link } from 'react-router'
import { connect } from 'react-redux';

export default class Login extends React.Component { 
  constructor(props) {
    super(props);
    console.log(props);
    props.api.GET('login', { email: this.props.params.email, key: this.props.params.key })
      .then(function(response) {
        props.api.GET('user')
          .then(data => props.dispatch({ type: 'LOGIN', data })).then(function(response) {
            window.location = '/';
          })
          .catch(e => console.log(e));
      });
  }

  render() {
    return <div>
      <h2>Redirecting to profile</h2>
    </div>
  }
}

export default connect(state => state)(Login);
