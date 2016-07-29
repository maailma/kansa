import React from 'react';  
import { Link } from 'react-router'
import API from '../api.js'

const apiHost = '139.162.147.227:3000';
const api = new API(`http://${apiHost}/`);

export default React.createClass({
	componentDidMount() {
	api.GET('login',{email:this.props.params.email,key:this.props.params.key})
  		.then(console.log('log'))
	},	

  render() {
    return (
      <div>
        <h2>{this.props.params.email}</h2>
      </div>
    )
  }
})