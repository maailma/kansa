const PATH_IN = '/profile';
const PATH_OUT = '/login';

export default class {

  constructor(api, store) {
    this.api = api;
    this.store = store;
  }

  getUser = () => this.api.GET('user');
  keyRequest = (email) => this.api.POST('key', { email });
  keyLogin = (email, key, router) => this.api.POST('login', { email, key })
    .then(res => {
      if (router) router.replace(PATH_IN);
      return res;
    });

  tryLogin = (nextState, replace, callback) => {
    const loc = nextState.location.pathname;
    this.getUser()
      .then(data => {
        this.store.dispatch({ type: 'LOGIN', data });
        if (loc !== PATH_IN) replace(PATH_IN);
        callback();
      })
      .catch(err => {
        if (loc !== PATH_OUT) replace(PATH_OUT);
        console.error('login failed', err);
        callback();
      });
  }

  check = (nextState, replace, callback) => {
    const email = this.store.getState().user.get('email');
    if (email) callback();
    else this.tryLogin(nextState, replace, callback);
  }

  doLogin = (nextState, replace, callback) => {
    const { email, key } = nextState.params;
    this.keyLogin(email, key)
      .then(() => tryLogin(nextState, replace, callback))
      .catch(e => callback(e));
  }

}
