import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { nominationFields } from '../../hugo/constants'
import { classify, initHugoAdmin } from '../actions'
import { HUGO_ADMIN_ROUTE_ROOT } from '../constants';
import CanonNominationList from './CanonNominationList'
import NominationDetails from './NominationDetails'
import NominationFilter from './NominationFilter'
import NominationMerger from './NominationMerger'

class Canon extends React.Component {

  static propTypes = {
    canon: React.PropTypes.instanceOf(Map).isRequired,
    classify: React.PropTypes.func.isRequired,
    initHugoAdmin: React.PropTypes.func.isRequired,
    isAdmin: React.PropTypes.bool.isRequired,
    nominations: React.PropTypes.instanceOf(List),
    params: React.PropTypes.shape({
      category: React.PropTypes.string.isRequired
    }).isRequired,
    setCategory: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    const { initHugoAdmin, isAdmin } = props;
    if (isAdmin) initHugoAdmin();
    this.state = {
      query: '',
      selected: List(),
      show: null
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
    const { canon, classify, isAdmin, nominations, params: { category }, setCategory } = this.props;
    const { query, selected, show } = this.state;
    return <div
      style={{ display: 'flex', height: 'calc(100vh - 56px - 48px)' }}
    >
      <NominationFilter
        category={category}
        query={query}
        setCategory={ category => {
          setCategory(category);
          this.setState({ query: '' });
        } }
        setQuery={ query => this.setState({
          query: query.toLowerCase(),
          selected: selected.clear()
        }) }
      />
      {
        isAdmin && nominations ? <CanonNominationList
          canon={canon}
          fields={nominationFields(category)}
          nominations={nominations}
          onSelect={this.onSelect}
          onShowDetails={ selected => this.setState({ show: selected }) }
          query={query}
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
      <NominationDetails
        category={category}
        onRequestClose={ () => this.setState({ show: null }) }
        selected={show}
      />
    </div>
  }
}

export default connect(
  ({ hugoAdmin, user }, { params: { category }}) => ({
    canon: hugoAdmin.getIn(['canon', category]) || Map(),
    isAdmin: user.get('hugoAdmin', false),
    nominations: hugoAdmin.getIn(['nominations', category])
  }), {
    classify,
    initHugoAdmin,
    setCategory: category => push(`${HUGO_ADMIN_ROUTE_ROOT}/${category}/nominations`)
  }
)(Canon);
