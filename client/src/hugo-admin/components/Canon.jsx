import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'

import { nominationFields } from '../../hugo/constants'
import CanonNominationList from './CanonNominationList'

class Canon extends React.Component {
  static propTypes = {
    canon: React.PropTypes.instanceOf(Map).isRequired,
    category: React.PropTypes.string.isRequired,
    nominations: React.PropTypes.instanceOf(List).isRequired,
  }

  render() {
    const { canon, category, nominations } = this.props;
    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
        <CanonNominationList
          canon={canon}
          fields={nominationFields(category)}
          nominations={nominations}
        />
      </div>
    )
  }
}

export default connect(
  ({ hugoAdmin }) => {
    const category = hugoAdmin.get('category');
    return {
      canon: hugoAdmin.getIn(['canon', category]) || Map(),
      category,
      nominations: hugoAdmin.getIn(['nominations', category]) || List()
    }
  }
)(Canon);
