import React from 'react';  
import { Link } from 'react-router'
import API from './../api.js'
import { connect } from 'react-redux';
const apiHost = 'localhost:3000';
const api = new API(`http://${apiHost}/`);

export default class Login extends React.Component { 

	componentDidMount() {
	 api.GET('login',{email:this.props.params.email,key:this.props.params.key})
  		.then(location.reload());
	}

  render() {
    return (
      <div>
        <h2>Redirecting to profile</h2>
      </div>
    )
  }
}