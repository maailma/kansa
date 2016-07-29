import React from 'react';  
import { Link } from 'react-router'

// ...
export default React.createClass({
  render() {
	console.log(this.props.params.email)
    return (
      <div>
        <h2>LOGIN</h2>
		Email: <br/>
		Key: <br/>
        <Link to="/login">Login</Link>
      </div>
    )
  }
})