import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'

import { fetchAllBallots } from '../actions';
import { minFinalistsPerCategory } from '../constants';
import { cleanBallots, selectFinalists } from '../nomination-count'

class Finalists extends React.Component {

  static propTypes = {
    allBallots: React.PropTypes.instanceOf(Map),
    allNominations: React.PropTypes.instanceOf(Map),
    canon: React.PropTypes.instanceOf(Map).isRequired,
    category: React.PropTypes.string.isRequired,
    fetchAllBallots: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    const { allBallots, allNominations, category, fetchAllBallots } = props;
    this.state = { log: List(), results: null }
    if (allBallots.isEmpty()) {
      fetchAllBallots();
    } else if (allNominations.has(category)) {
      this.getFinalists();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { allBallots, allNominations, canon, category, fetchAllBallots } = nextProps;
    if (
      !allBallots.equals(this.props.allBallots) ||
      !canon.equals(this.props.canon) ||
      !allNominations.equals(this.props.allNominations)
    ) {
      this.setState({ log: List(), results: null });
      if (allBallots.isEmpty()) {
        fetchAllBallots();
      } else if (allNominations.has(category)) {
        this.getFinalists();
      }
    }
  }

  getFinalists() {
    setTimeout(() => {
      const { allBallots, allNominations, canon, category } = this.props;
      console.warn('Calculating finalists for', category);
      const cb = cleanBallots(category, allBallots, allNominations, canon);
      const results = selectFinalists(minFinalistsPerCategory, cb, this.logSelectionRound);
      this.setState({ results });
      console.warn('RESULTS', results.toJS());
    });
  }

  logSelectionRound = (ballots, counts, nextEliminations) => {
    const entry = Map({ ballots, counts, nextEliminations });
    this.setState({ log: this.state.log.push(entry) });
    console.log('ballots:', ballots.toJS(), 'counts:', counts.toJS(), 'next:', nextEliminations.toJS());
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
    allBallots: hugoAdmin.get('ballots'),
    allNominations: hugoAdmin.get('nominations'),
    canon: hugoAdmin.getIn(['canon', category]) || Map()
  }), {
    fetchAllBallots
  }
)(Finalists);
