import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'

import { nominationFields } from '../../hugo/constants'
import { classify } from '../actions'
import CanonNominationList from './CanonNominationList'
import NominationDetails from './NominationDetails'
import NominationMerger from './NominationMerger'

class Canon extends React.Component {

  static propTypes = {
    ballots: React.PropTypes.instanceOf(List),
    canon: React.PropTypes.instanceOf(Map).isRequired,
    category: React.PropTypes.string.isRequired,
    classify: React.PropTypes.func.isRequired,
    nominations: React.PropTypes.instanceOf(List),
    query: React.PropTypes.string
  }

  state = {
    selected: List(),
    show: null
  }

  componentWillReceiveProps(nextProps) {
    const { category, query } = this.props;
    if (nextProps.category !== category || nextProps.query !== query) {
      this.setState({ selected: this.state.selected.clear() });
    }
  }

  onSelect = (item) => {
    if (Map.isMap(item)) {
      const s = this.state.selected;
      const i = s.indexOf(item);
      this.setState({ selected: i < 0 ? s.push(item) : s.delete(i) });
    }
  }

  render() {
    const { ballots, canon, category, classify, nominations, query } = this.props;
    const { selected, show } = this.state;
    return nominations ? <div
      style={{ display: 'flex', height: 'calc(100vh - 56px - 48px)' }}
    >
      <CanonNominationList
        ballots={ballots}
        canon={canon}
        fields={nominationFields(category)}
        nominations={nominations}
        onSelect={this.onSelect}
        onShowDetails={ selected => this.setState({ show: selected }) }
        query={query}
        selected={selected}
        style={{ flex: '1 1 auto' }}
      />
      {
        selected.size >= 2 ? <NominationMerger
          category={category}
          classify={classify}
          nominations={nominations}
          onSuccess={ () => this.setState({ selected: selected.clear() }) }
          selected={selected}
        /> : null
      }
      <NominationDetails
        category={category}
        onRequestClose={ () => this.setState({ show: null }) }
        selected={show}
      />
    </div> : <span>Loading...</span>
  }
}

export default connect(
  ({ hugoAdmin }, { category }) => ({
    ballots: hugoAdmin.getIn(['ballots', category]),
    canon: hugoAdmin.getIn(['canon', category]) || Map(),
    nominations: hugoAdmin.getIn(['nominations', category])
  }), {
    classify
  }
)(Canon);
