import { List, Map } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import filterPeople from '../filterPeople';
import { HelpDialog } from './Help';
import Member from './Member';
import MemberTable from './MemberTable';
import NewMember from './NewMember';
import Toolbar from './Toolbar';

class App extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    api: PropTypes.object.isRequired,
    people: PropTypes.instanceOf(List).isRequired,
    user: PropTypes.instanceOf(Map).isRequired
  }

  static defaultProps = {
    title: 'Kansa'
  }

  state = {
    filter: '',
    helpOpen: false,
    member: null
  }

  constructor(props) {
    super(props);
    const defaultTitle = App.defaultProps.title;
    let title = props.title;
    if (title.indexOf(defaultTitle) === -1) title = `${defaultTitle} - ${title}`;
    document.title = title;
  }

  componentWillReceiveProps(nextProps) {
    const prevMember = this.state.member;
    if (prevMember) {
      const id = prevMember.get('id');
      const member = nextProps.list && nextProps.list.find(m => m && m.get('id') === id) || null;
      this.setState({ member });
    }
  }

  render() {
    const { title, api, people, user } = this.props;
    const { filter, helpOpen, member } = this.state;
    const list = filterPeople(people, filter);
    return <div>
      <Toolbar
        title={title}
        filter={filter}
        user={user}
        onFilterChange={ filter => this.setState({ filter }) }
        onHelp={ () => this.setState({ helpOpen: true }) }
        onLogout={ () => api.GET('logout')
          .then(res => location.reload())
          .catch(e => console.error('Logout failed', e))
        }
      />

      <MemberTable
        list={list}
        onMemberSelect={ member => this.setState({ member }) }
      />

      <Member
        api={api}
        handleClose={ () => this.setState({ member: null }) }
        member={member}
      />

      <NewMember add={ member => api.POST('people', member.toJS()) }>
        <FloatingActionButton style={{ position: 'fixed', bottom: '24px', right: '24px' }} >
          <ContentAdd />
        </FloatingActionButton>
      </NewMember>

      <HelpDialog
        open={helpOpen}
        handleClose={ () => this.setState({ helpOpen: false }) }
      />
    </div>;
  }
}

export default connect(state => state)(App);
