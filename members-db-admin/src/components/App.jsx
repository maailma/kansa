import React from 'react';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';

import MemberTable from './MemberTable';

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
        <div style={{ position: 'fixed', right: 0, height: '30px' }}>
          <b>Email:</b> {user.get('email')}
          <hr/>
        </div>
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
