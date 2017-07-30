import { List } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { locationShape } from 'react-router'

import { initHugoAdmin } from '../actions'
import NominationToolbar from './nomination-toolbar'
import '../style.css'

class App extends React.Component {
  static propTypes = {
    initHugoAdmin: PropTypes.func.isRequired,
    location: locationShape.isRequired,
    nominations: PropTypes.instanceOf(List),
    params: PropTypes.shape({
      category: PropTypes.string.isRequired
    }).isRequired,
    showBallotCounts: PropTypes.bool.isRequired
  }

  state = {
    query: ''
  }

  componentDidMount () {
    const { initHugoAdmin } = this.props
    initHugoAdmin()
  }

  componentWillReceiveProps ({ initHugoAdmin, nominations }) {
    if (!nominations) initHugoAdmin()
  }

  render () {
    const { children, location: { pathname }, params: { category }, showBallotCounts } = this.props
    const { query } = this.state
    return <div>
      <NominationToolbar
        category={category}
        pathname={pathname}
        query={query}
        setQuery={query => this.setState({ query: query.toLowerCase() })}
        showBallotCounts={showBallotCounts}
      />
      <main>
        {React.Children.map(children, (child) => (
          React.cloneElement(child, { category, query })
        ))}
      </main>
    </div>
  }
}

export default connect(
  ({ hugoAdmin }, { params: { category } }) => ({
    nominations: hugoAdmin.getIn(['nominations', category]),
    showBallotCounts: hugoAdmin.get('showBallotCounts')
  }), {
    initHugoAdmin
  }
)(App)
