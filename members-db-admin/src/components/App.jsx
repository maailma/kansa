import React from 'react';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';

class App extends React.Component {
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
        <b>People:</b> <ul>{people}</ul>
      </div>
    );
  }
  // shouldComponentUpdate(nextProps, nextState) { return false; }
}

App.propTypes = {
  people: React.PropTypes.instanceOf(List).isRequired,
  user: React.PropTypes.instanceOf(Map).isRequired
};

export default connect(state => state)(App);
