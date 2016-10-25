import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'

import { nominationFields } from '../../hugo/constants'
import { initHugoAdmin } from '../actions'
import CanonNominationList from './CanonNominationList'

class Canon extends React.Component {

  static propTypes = {
    canon: React.PropTypes.instanceOf(Map).isRequired,
    category: React.PropTypes.string.isRequired,
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

  render() {
    const { canon, category, isAdmin, nominations } = this.props;
    return <div
      style={{ display: 'flex', height: 'calc(100vh - 56px - 48px)' }}
    >{
      isAdmin && nominations ? <CanonNominationList
        canon={canon}
        fields={nominationFields(category)}
        nominations={nominations}
      /> : isAdmin ? 'Loading...' : 'Admin rights required'
    }</div>
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
    initHugoAdmin
  }
)(Canon);
