import { Map } from 'immutable'
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
import { editNomination, submitNominations, resetNominations } from '../actions'
import { categoryInfo, maxNominationsPerCategory, nominationFields } from '../constants'

import { NominationFillerRow, NominationRow } from './NominationRow'



class NominationActionsRow extends React.Component {
  static propTypes = {
    disabled: React.PropTypes.bool.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired,
    saveTime: React.PropTypes.instanceOf(Date)
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.disabled !== this.props.disabled || nextProps.saveTime !== this.props.saveTime;
  }

  render() {
    const { disabled, onSave, onReset, saveTime } = this.props;
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
      <Col xs>
        <RaisedButton
          label='Save'
          disabled={disabled}
          disabledBackgroundColor='transparent'
          icon={<ListCheck />}
          onTouchTap={onSave}
          style={{ float: 'right', marginLeft: 15 }}
        />
        <RaisedButton
          label='Reset'
          disabled={disabled}
          disabledBackgroundColor='transparent'
          icon={<ContentUndo />}
          onTouchTap={onReset}
          style={{ float: 'right', marginLeft: 15 }}
        />
      </Col>
    </Row>;
  }
}

const nominationRowLinks = (n, props) => {
  if (n <= 0) return null;
  const res = [];
  for (let i = 0; i < n; ++i) res.push(<NominationFillerRow key={`link-${i}`} {...props} />);
  return res;
}

const NominationBody = ({ colSpan, fields, maxNominations, onChange, onSave, onReset, state }) => {
  const clientData = state.get('clientData');
  const serverData = state.get('serverData');
  const serverTime = state.get('serverTime');
  const isFetching = state.get('isFetching');
  const rows = clientData.size < maxNominations ? clientData.push(Map()) : clientData;
  const lastRow = {};
  return <div>
    {
      rows.map((rowValues, idx) => <NominationRow
        key={idx}
        colSpan={colSpan}
        defaultValues={ serverData.get(idx, Map()) }
        disabled={isFetching}
        fields={fields}
        onChange={ (field, value) => onChange(idx, rowValues.set(field, value)) }
        onRemove={ () => onChange(idx, null) }
        setLastField={ (field, ref) => lastRow[field] = ref }
        values={rowValues}
      />)
    }
    { nominationRowLinks(maxNominations - rows.size, { colSpan, fields, lastRow }) }
    <NominationActionsRow
      disabled={ isFetching || clientData.equals(serverData) }
      onSave={onSave}
      onReset={onReset}
      saveTime={ serverTime ? new Date(serverTime) : null }
    />
  </div>;
}

NominationBody.propTypes = {
  colSpan: React.PropTypes.number.isRequired,
  fields: React.PropTypes.array.isRequired,
  maxNominations: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired,
  onSave: React.PropTypes.func.isRequired,
  onReset: React.PropTypes.func.isRequired,
  state: ImmutablePropTypes.mapContains({
    clientData: ImmutablePropTypes.list.isRequired,
    serverData: ImmutablePropTypes.list.isRequired,
    //serverTime: React.PropTypes.string,
    //isFetching: React.PropTypes.bool.isRequired,
    //error: React.PropTypes.string
  }).isRequired
};

const NominationCategory = ({ category, ...props }) => {
  const { title, description, nominationFieldLabels } = categoryInfo[category];
  const fields = nominationFields(category);
  const colSpan = Math.floor(12 / fields.size);

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
      <Row>{
        fields.map(field => <Col
          key={field}
          xs={colSpan}
        >
          <h3>{ nominationFieldLabels[field] || field }</h3>
        </Col>)
      }</Row>
      <NominationBody
        {...props}
        colSpan={colSpan}
        fields={fields}
        maxNominations={maxNominationsPerCategory}
      />
    </CardText>
  </Card>
}

export default connect(
  (state, { category }) => ({
    state: state.nominations.get(category)
  }), (dispatch, { category }) => bindActionCreators({
    onChange: (idx, values) => editNomination(category, idx, values),
    onSave: () => submitNominations(category),
    onReset: () => resetNominations(category)
  }, dispatch)
)(NominationCategory);
