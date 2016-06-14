import 'whatwg-fetch';

export default class API {
  constructor(root) {
    this.root = root;  // [scheme]://[host]:[port]/[path]/
  }

  static queryFromObj(obj) {
    return !obj ? '' : '?' + Object.keys(obj)
      .map(k => k + '=' + encodeURIComponent(obj[k]))
      .join('&');
  }

  GET(path, params) {
    const uri = this.root + path + API.queryFromObj(params);
    return fetch(uri, { credentials: 'include' });
  }
}
