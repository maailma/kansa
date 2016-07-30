import { List, Map } from 'immutable';
import React from 'react';
import { connect } from 'react-redux';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import filterPeople from '../filterPeople';
import MemberTable from './MemberTable';
import NewMember from './NewMember';
import Toolbar from './Toolbar';

class App extends React.Component {
  static propTypes = {
    api: React.PropTypes.object.isRequired,
    people: React.PropTypes.instanceOf(List).isRequired,
    user: React.PropTypes.instanceOf(Map).isRequired
  }

  state = {
    filter: ''
  }

  render() {
    const { api, user, people } = this.props;
    const { filter } = this.state;
    const list = filterPeople(people, filter);
    return <div>
      <Toolbar
        filter={filter}
        user={user}
        onFilterChange={ filter => this.setState({ filter }) }
        onLogout={ () => api.GET('logout')
          .then(res => location.reload())
          .catch(e => console.error('Logout failed', e))
        }
      />

      <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
        <div style={{ flex: '1 1 auto' }}>
          <MemberTable api={api} list={list} />
        </div>
      </div>

      <NewMember add={ member => api.POST('people', member.toJS()) }>
        <FloatingActionButton style={{ position: 'fixed', bottom: '24px', right: '24px' }} >
          <ContentAdd />
        </FloatingActionButton>
      </NewMember>
    </div>;
  }
}

export default connect(state => state)(App);
