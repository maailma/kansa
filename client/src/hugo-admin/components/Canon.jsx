import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'

import { nominationFields } from '../../hugo/constants'
import { classify, initHugoAdmin, setCategory } from '../actions'
import CanonNominationList from './CanonNominationList'
import NominationFilter from './NominationFilter'
import NominationMerger from './NominationMerger'

class Canon extends React.Component {

  static propTypes = {
    canon: React.PropTypes.instanceOf(Map).isRequired,
    category: React.PropTypes.string.isRequired,
    classify: React.PropTypes.func.isRequired,
    initHugoAdmin: React.PropTypes.func.isRequired,
    isAdmin: React.PropTypes.bool.isRequired,
    nominations: React.PropTypes.instanceOf(List)
  }

  constructor(props) {
    super(props);
    const { initHugoAdmin, isAdmin } = props;
    if (isAdmin) initHugoAdmin();
    this.state = {
      selected: List()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { initHugoAdmin, isAdmin, nominations } = nextProps;
    if (!nominations && isAdmin) initHugoAdmin();
  }

  onSelect = (item) => {
    if (Map.isMap(item)) {
      const s = this.state.selected;
      const i = s.indexOf(item);
      this.setState({ selected: i < 0 ? s.push(item) : s.delete(i) });
    }
  }

  render() {
    const { canon, category, classify, isAdmin, nominations, setCategory } = this.props;
    const { selected } = this.state;
    return <div
      style={{ display: 'flex', height: 'calc(100vh - 56px - 48px)' }}
    >
      <NominationFilter
        category={category}
        setCategory={setCategory}
      />
      {
        isAdmin && nominations ? <CanonNominationList
          canon={canon}
          fields={nominationFields(category)}
          nominations={nominations}
          onSelect={this.onSelect}
          selected={selected}
          style={{ flex: '1 1 auto' }}
        /> : isAdmin ? 'Loading...' : 'Admin rights required'
      }{
        selected.size >= 2 ? <NominationMerger
          category={category}
          classify={classify}
          nominations={nominations}
          onSuccess={ () => this.setState({ selected: selected.clear() }) }
          selected={selected}
        /> : null
      }
    </div>
  }
}

export default connect(
  ({ hugoAdmin, user }) => {
    const category = hugoAdmin.get('category');
    return {
      canon: hugoAdmin.getIn(['canon', category]) || Map(),
      category,
      isAdmin: user.get('hugoAdmin', false),
      nominations: hugoAdmin.getIn(['nominations', category])
    }
  }, {
    classify,
    initHugoAdmin,
    setCategory
  }
)(Canon);
