import { List } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { locationShape } from 'react-router'

import { initHugoAdmin } from '../actions'
import NominationToolbar from './nomination-toolbar'
import '../style.css'

class App extends React.Component {

  static propTypes = {
    initHugoAdmin: React.PropTypes.func.isRequired,
    location: locationShape.isRequired,
    nominations: React.PropTypes.instanceOf(List),
    params: React.PropTypes.shape({
      category: React.PropTypes.string.isRequired
    }).isRequired,
    showBallotCounts: React.PropTypes.bool.isRequired
  }

  state = {
    query: ''
  }

  componentDidMount() {
    const { initHugoAdmin } = this.props
    initHugoAdmin()
  }

  componentWillReceiveProps ({ initHugoAdmin, nominations }) {
    if (!nominations) initHugoAdmin()
  }

  render() {
    const { children, location: { pathname }, params: { category }, showBallotCounts } = this.props
    const { query } = this.state
    return <div>
      <NominationToolbar
        category={category}
        pathname={pathname}
        query={query}
        setQuery={ query => this.setState({ query: query.toLowerCase() }) }
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
  ({ hugoAdmin }, { params: { category }}) => ({
    nominations: hugoAdmin.getIn(['nominations', category]),
    showBallotCounts: hugoAdmin.get('showBallotCounts')
  }), {
    initHugoAdmin
  }
)(App)
