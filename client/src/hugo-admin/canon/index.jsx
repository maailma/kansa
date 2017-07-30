import { List, Map } from 'immutable'
import React from 'react'

import { categoryGroups } from '../constants';
import CanonNominationList from './nomination-list'
import NominationDetails from './nomination-details'
import NominationMerger from './nomination-merger'

export default class Canon extends React.Component {

  static propTypes = {
    category: React.PropTypes.string,
    query: React.PropTypes.string
  }

  state = {
    selected: List(),
    show: null
  }

  get categories() {
    const { category } = this.props;
    const cg = categoryGroups[category];
    return !cg || cg.length === 0 ? [category] : cg;
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
    const { category, query } = this.props;
    const { selected, show } = this.state;
    if (!category) return null;
    return <div
      style={{ display: 'flex', height: 'calc(100vh - 56px - 48px)' }}
    >
      <CanonNominationList
        categories={this.categories}
        onSelect={this.onSelect}
        onShowDetails={ selected => this.setState({ show: selected }) }
        query={query}
        selected={selected}
        style={{ flex: '1 1 auto' }}
      />
      {
        selected.size >= 2 ? <NominationMerger
          onSuccess={ () => this.setState({ selected: selected.clear() }) }
          selected={selected}
        /> : null
      }
      <NominationDetails
        setSelected={ show => this.setState({ show }) }
        selected={show}
      />
    </div>
  }
}
