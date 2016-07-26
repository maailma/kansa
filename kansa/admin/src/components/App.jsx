import React from 'react';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';

import MemberTable from './MemberTable';

function logout(api) {
  api.GET('logout')
    .then(res => {
      console.log('Logout', res);
      location.reload();
    })
    .catch(e => {
      console.error('Logout failed');
      console.log(e);
    });
}

class App extends React.Component {
  static propTypes = {
    api: React.PropTypes.object.isRequired,
    people: React.PropTypes.instanceOf(List).isRequired,
    user: React.PropTypes.instanceOf(Map).isRequired
  }

  render() {
    const { api, user, people } = this.props;
    return (
      <div>
        <ul className='user-info'>
          <li>{user.get('email')}</li>
          <li><a onClick={() => logout(api)}>Logout</a></li>
        </ul>
        <div style={{ display: 'flex', height: 'calc(100vh - 30px)' }}>
          <div style={{ flex: '1 1 auto' }}>
            <MemberTable api={api} list={people} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => state)(App);
