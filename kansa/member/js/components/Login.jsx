import React from 'react';  
import { Link } from 'react-router'
import API from './../api.js'
import { connect } from 'react-redux';
const apiHost = 'localhost:3000';
const api = new API(`http://${apiHost}/`);

export default class Login extends React.Component { 
  constructor(props) {
    super(props);

     api.GET('login',{email:this.props.params.email,key:this.props.params.key})
      .then(function(response){
        

api.GET('user')
  .then(data => props.dispatch({ type: 'LOGIN', data })).then(function(response) {

   window.location = '/';

  })
  .catch(e => console.log(e));



      });


  }

	componentDidMount() {

	}

  render() {
    return (
      <div>
        <h2>Redirecting to profile</h2>
      </div>
    )
  }
}
export default connect(state => state)(Login);
