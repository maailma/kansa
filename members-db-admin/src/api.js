import 'whatwg-fetch';

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
}
