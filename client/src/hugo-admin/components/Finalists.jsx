import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'

import { fetchBallots } from '../actions';
import { minFinalistsPerCategory } from '../constants';
import { cleanBallots, selectFinalists } from '../nomination-count'

class Finalists extends React.Component {

  static propTypes = {
    ballots: React.PropTypes.instanceOf(List),
    canon: React.PropTypes.instanceOf(Map).isRequired,
    category: React.PropTypes.string.isRequired,
    fetchBallots: React.PropTypes.func.isRequired,
    nominations: React.PropTypes.instanceOf(List)
  }

  constructor(props) {
    super(props);
    const { ballots, canon, category, fetchBallots, nominations } = props;
    this.state = { log: List(), results: null }
    if (ballots) {
      if (canon && nominations) this.getFinalists();
    } else {
      fetchBallots(category);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { ballots, canon, category, fetchBallots, nominations } = nextProps;
    if (
      !ballots || !ballots.equals(this.props.ballots) ||
      !canon || !canon.equals(this.props.canon) ||
      !nominations || !nominations.equals(this.props.nominations)
    ) {
      this.setState({ log: List(), results: null });
      if (ballots) {
        if (canon && nominations) this.getFinalists();
      } else {
        fetchBallots(category);
      }
    }
  }

  getFinalists() {
    setTimeout(() => {
      const { ballots, canon, category, nominations } = this.props;
      console.warn('Calculating finalists for', category);
      const cb = cleanBallots(ballots, nominations, canon);
      const results = selectFinalists(minFinalistsPerCategory, cb, this.logSelectionRound);
      this.setState({ results });
      console.warn('RESULTS', results.toJS());
    });
  }

  logSelectionRound = (ballotCount, nominationCount, nextEliminations) => {
    const entry = Map({ ballotCount, nominationCount, nextEliminations });
    this.setState({ log: this.state.log.push(entry) });
    console.log('ballots:', ballotCount, 'nominations:', nominationCount, 'next:', nextEliminations.toJS());
  }

  render() {
    const { results } = this.state;
    return results ? <pre>
      { JSON.stringify(results.toJS(), null, '  ') }
    </pre> : <span>Counting...</span>
  }
}

export default connect(
  ({ hugoAdmin }, { category }) => ({
    ballots: hugoAdmin.getIn(['ballots', category]),
    canon: hugoAdmin.getIn(['canon', category]) || Map(),
    nominations: hugoAdmin.getIn(['nominations', category])
  }), {
    fetchBallots
  }
)(Finalists);
