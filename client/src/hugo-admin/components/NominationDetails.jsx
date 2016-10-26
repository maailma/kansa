import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { AutoSizer, Column, Table } from 'react-virtualized'

import Dialog from 'material-ui/Dialog'

import { nominationFields } from '../../hugo/constants'

import { classify, fetchBallots } from '../actions'

const headerHeight = 30;
const overscanRowCount = 10;
const rowHeight = 30;

class NominationDetails extends React.Component {

  static propTypes = {
    ballots: React.PropTypes.instanceOf(List),
    category: React.PropTypes.string.isRequired,
    classify: React.PropTypes.func.isRequired,
    fetchBallots: React.PropTypes.func.isRequired,
    nominations: React.PropTypes.instanceOf(List).isRequired,
    onRequestClose: React.PropTypes.func.isRequired,
    selected: React.PropTypes.instanceOf(Map)
  }

  componentWillReceiveProps(nextProps) {
    const { ballots, category, fetchBallots, nominations, onRequestClose, selected } = nextProps;
    if (selected) {
      if (nominations.size === 0) onRequestClose();
      else if (!ballots) fetchBallots(category);
    }
  }

  render() {
    const { ballots, category, classify, nominations, onRequestClose, selected } = this.props;
    return <Dialog
      onRequestClose={onRequestClose}
      open={!!selected}
    >
      <div style={{ height: '75vh' }}>
        <AutoSizer>
          { ({ height, width }) => (
            <Table
              headerHeight={headerHeight}
              height={height}
              overscanRowCount={overscanRowCount}
              rowCount={nominations.size}
              rowGetter={({ index }) => nominations.get(index)}
              rowHeight={rowHeight}
              width={width}
            >
              <Column
                cellDataGetter={ ({ rowData }) => {
                  if (!ballots) return '';
                  return ballots.reduce((res, ballot) => {
                    if (ballot.get('nominations').includes(rowData)) ++res;
                    return res;
                  }, 0);
                } }
                dataKey='count'
                label='#'
                width={20}
              />
              { nominationFields(category).map(key => (
                <Column
                  dataKey={key}
                  flexGrow={1}
                  key={key}
                  label={key}
                  width={100}
                />
              )) }
              <Column
                cellDataGetter={() => {}}
                cellRenderer={ ({ rowData }) => <span
                  onClick={ () => classify(category, [rowData], null) }
                  style={{ cursor: 'pointer' }}
                >x</span> }
                dataKey='drop'
                label=''
                width={20}
              />
            </Table>
          ) }
        </AutoSizer>
      </div>
    </Dialog>
  };
}

export default connect(
  ({ hugoAdmin }, ownProps) => {
    const { category, selected } = ownProps;
    if (!Map.isMap(selected)) return {
      nominations: List()
    }
    const canonId = selected.get('canon_id');
    return {
      ballots: hugoAdmin.getIn(['ballots', category]),
      nominations: canonId && (
        hugoAdmin.getIn(['nominations', category])
          .filter(nom => nom.get('canon_id') === canonId)
          .map(nom => nom.get('data'))
      ) || List.of(selected.get('data'))
    }
  }, {
    classify,
    fetchBallots
  }
)(NominationDetails);
