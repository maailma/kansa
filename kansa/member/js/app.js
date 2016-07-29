import React from 'react';  
import { render } from 'react-dom'
import { DefaultRoute, Router, Link, Route, RouteHandler, hashHistory } from 'react-router';

import Login from './components/Login.js';
import App from './components/App.js';

/*** Would here catch query parameters or show form with email and key **/


let routes = (
<Router history={hashHistory}>  
  <Route path="/" component={App} />
  <Route path="/login/:email/:key" component={Login}/>
</Router>
);

// Router.run(routes, function (Handler) {  
//   React.render(<Handler/>, document.body);
// });

render((
  routes
  ), document.getElementById('react'))
