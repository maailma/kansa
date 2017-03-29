import { fromJS, List, Map } from 'immutable'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import ListCheck from 'material-ui/svg-icons/av/playlist-add-check'
import ContentUndo from 'material-ui/svg-icons/content/undo'
const { Col, Row } = require('react-flexbox-grid');

import time_diff from '../../lib/time_diff'
import { categoryInfo, nominationFields } from '../../hugo-nominations/constants'

import VoteList from './VoteList'

const demoFinalists = (category) => {
  const labels = categoryInfo[category].nominationFieldLabels;
  return ['A', 'B', 'C', 'D', 'E', 'F']
    .map(x => Object.keys(labels).reduce((data, field) => {
      data[field] = labels[field] + ' ' + x;
      return data;
    }, {}));
}

/*
class VoteStatusRow extends React.Component {
  static propTypes = {
    saveTime: React.PropTypes.instanceOf(Date)
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.saveTime !== this.props.saveTime;
  }

  render() {
    const { saveTime } = this.props;
    return <Row
      middle='xs'
      style={{ paddingTop: 20 }}
    >
      <Col xs>
        { saveTime ? <span
          style={{ color: 'rgba(0, 0, 0, 0.3)' }}
          title={saveTime}
        >{ 'Last saved ' + time_diff(saveTime) }</span> : null }
      </Col>
    </Row>;
  }
}
*/

class VoteCategory extends React.Component {

  state = {
    preference: List()
  }

  setPreference = (idx, entry) => {
    let { preference } = this.state;
    if (entry) {
      let prevIdx;
      do {
        prevIdx = preference.findKey(e => entry.equals(e));
        if (typeof prevIdx !== 'number') break;
        if (prevIdx === idx) return;
        if (prevIdx < idx) {
          preference = preference.set(prevIdx, null);
        } else {
          preference = preference.delete(prevIdx)
        }
      } while (preference.size)
      if (preference.get(idx)) {
        if (preference.size >= 7) ++idx;
        preference = preference.insert(idx, entry);
      } else {
        preference = preference.set(idx, entry);
      }
    } else {
      preference = preference.delete(idx);
    }
    while (preference.size && !preference.last()) {
      preference = preference.pop();
    }
    while (preference.size > 7) {
      const emptyIdx = preference.findLastKey(e => !e);
      if (typeof emptyIdx !== 'number') break;
      preference = preference.delete(emptyIdx);
    }
    this.setState({ preference });
  }

  render() {
    const { category } = this.props;
    const { preference } = this.state;
    const { title, description } = categoryInfo[category];

    return <Card className='NominationCategory'>
      <CardHeader
        className='NominationHeader'
        title={title}
        titleStyle={{
          fontSize: 24,
          fontWeight: 300,
          textAlign: 'center',
          width: '100%',
        }}
      />
      <CardText>
        { description }
      </CardText>
      <CardText>
        <VoteList
          fields={nominationFields(category)}
          finalists={fromJS(demoFinalists(category))}
          preference={preference}
          setPreference={this.setPreference}
        />
      </CardText>
    </Card>
  }
}

export default VoteCategory;

/*
export default connect(
  (state, { category }) => ({
    state: state.nominations.get(category)
  }), (dispatch, { category, signature }) => bindActionCreators({
    onChange: (idx, values) => editNomination(category, idx, values),
    onSave: () => submitNominations(category, signature),
    onReset: () => resetNominations(category)
  }, dispatch)
)(VoteCategory);
*/
