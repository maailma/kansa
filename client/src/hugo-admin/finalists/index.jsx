import { List, Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import { fetchAllBallots } from '../actions'
import { minFinalistsPerCategory } from '../constants'
import { cleanBallots, selectFinalists } from '../nomination-count'

import Results from './results'

class Finalists extends React.Component {
  static propTypes = {
    allBallots: PropTypes.instanceOf(Map),
    allNominations: PropTypes.instanceOf(Map),
    canon: PropTypes.instanceOf(Map).isRequired,
    category: PropTypes.string.isRequired,
    fetchAllBallots: PropTypes.func.isRequired,
    sainteLague: PropTypes.bool
  }

  constructor(props) {
    super(props)
    const { allBallots, allNominations, category, fetchAllBallots } = props
    this.state = { log: List(), results: null }
    if (allBallots.isEmpty()) {
      fetchAllBallots()
    } else if (allNominations.has(category)) {
      this.getFinalists()
    }
  }

  componentWillReceiveProps({
    allBallots,
    allNominations,
    canon,
    category,
    fetchAllBallots,
    sainteLague
  }) {
    if (
      !allBallots.equals(this.props.allBallots) ||
      !canon.equals(this.props.canon) ||
      !allNominations.equals(this.props.allNominations) ||
      sainteLague !== this.props.sainteLague
    ) {
      this.setState({ log: List(), results: null })
      if (allBallots.isEmpty()) {
        fetchAllBallots()
      } else if (allNominations.has(category)) {
        this.getFinalists()
      }
    }
  }

  getFinalists() {
    setTimeout(() => {
      const {
        allBallots,
        allNominations,
        canon,
        category,
        sainteLague
      } = this.props
      const cb = cleanBallots(category, allBallots, allNominations, canon)
      const results = selectFinalists(
        minFinalistsPerCategory,
        sainteLague,
        cb,
        this.logSelectionRound
      )
      this.setState({ results })
    }, 200)
  }

  logSelectionRound = (ballots, counts, next) => {
    const { log } = this.state
    this.setState({ log: log.push(Map({ counts, next })) })
  }

  render() {
    const { category, sainteLague } = this.props
    const { log, results } = this.state
    return results ? (
      <div style={{ display: 'flex' }}>
        <Results
          category={category}
          log={log}
          results={results}
          sainteLague={sainteLague}
          style={{ flex: '1 1 auto' }}
        />
      </div>
    ) : (
      <span style={{ paddingLeft: 12 }}>Counting...</span>
    )
  }
}

export default connect(
  ({ hugoAdmin }, { category }) => ({
    allBallots: hugoAdmin.get('ballots'),
    allNominations: hugoAdmin.get('nominations'),
    canon: hugoAdmin.getIn(['canon', category]) || Map(),
    sainteLague: hugoAdmin.get('sainteLague')
  }),
  {
    fetchAllBallots
  }
)(Finalists)
