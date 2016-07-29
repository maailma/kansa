import React from 'react';  
import { render } from 'react-dom'
import { DefaultRoute, Router, Link, Route, RouteHandler, hashHistory } from 'react-router';
import 'whatwg-fetch';

import Login from './components/Login.js';
import App from './components/App.js';

export default class API {
  constructor(root) {
    this.root = root;  // [scheme]://[host]:[port]/[path]/
  }

  static parse(response) {
    if (response.ok) return response.json();
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }

  static queryFromObj(obj) {
    return !obj ? '' : '?' + Object.keys(obj)
      .map(k => k + '=' + encodeURIComponent(obj[k]))
      .join('&');
  }

  path(cmd, params) {
    return this.root + cmd + API.queryFromObj(params);
  }

  GET(cmd, params) {
    const uri = this.path(cmd, params);
    return fetch(uri, { credentials: 'include' })
      .then(response => API.parse(response));
  }

  POST(cmd, body) {
    const uri = this.path(cmd);
    const opt = { credentials: 'include', method: 'POST' };
    if (typeof body == 'string') {
      opt.body = body;
    } else {
      opt.headers = { 'Content-Type': 'application/json' };
      opt.body = JSON.stringify(body);
    }
    return fetch(uri, opt)
      .then(response => API.parse(response));
  }
}

const apiHost = '139.162.147.227:3000';
const api = new API(`http://${apiHost}/`);

/*** Would here catch query parameters or show form with email and key **/

api.GET('login',{email:'admin@example.com',key:'key'})
  .then(console.log('log'))


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
