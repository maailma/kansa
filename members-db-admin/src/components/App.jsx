import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

class App extends React.Component {
  render() {
    const pl = this.props.people.toArray().map(p => <li key={p}>{p}</li>);
    return (
      <ul>{pl}</ul>
    );
  }
  // shouldComponentUpdate(nextProps, nextState) { return false; }
}

App.propTypes = {
  people: PropTypes.object.isRequired
};

export default connect(state => state)(App);
