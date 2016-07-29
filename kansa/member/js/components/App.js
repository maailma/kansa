import React from 'react';  
import { Link } from 'react-router'

// ...
export default React.createClass({
  	handleEmailChange: function(e) {
	   this.setState({email: e.target.value});
	},
	handleKeyChange: function(e) {
	   this.setState({key: e.target.value});
	},
	handleLogin: function() {
		console.log(this.state.email)
		window.location = '#/login/'+this.state.email+'/'+this.state.key
	},

	render() {

    return (
      <div>
        <h2>LOGIN</h2>
		Email: <input type="text" name="email" id="email" onChange={this.handleEmailChange} /><br/>
		Key: <input type="text" name="key" id="key" onChange={this.handleKeyChange} /><br/>
		<button type="button" onClick={this.handleLogin}>Login</button>
      </div>
    )
  }
})