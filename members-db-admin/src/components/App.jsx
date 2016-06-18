import React from 'react';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';

import MemberTable from './MemberTable';

class App extends React.Component {
  static propTypes = {
    people: React.PropTypes.instanceOf(List).isRequired,
    user: React.PropTypes.instanceOf(Map).isRequired
  }

  render() {
    const people = this.props.people
      .toSeq()
      .filter(p => p)
      .map(p => <li key={p.get('id')}>{
        p.get('id') + ' ' + p.get('legal_name')
      }</li>)
      .toJS();
    return (
      <div>
        <b>Email:</b> {this.props.user.get('email')}
        <hr/>
        <MemberTable list={this.props.people} />
      </div>
    );
  }
  // shouldComponentUpdate(nextProps, nextState) { return false; }
}

export default connect(state => state)(App);
