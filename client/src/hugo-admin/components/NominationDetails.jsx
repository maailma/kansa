import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { AutoSizer, Column, Table } from 'react-virtualized'
import Dialog from 'material-ui/Dialog'
import ContentClear from 'material-ui/svg-icons/content/clear'

import { nominationFields } from '../../hugo/constants'
import { classify, fetchBallots, updateCanonEntry } from '../actions'
import './NominationDetails.css'

const headerHeight = 30;
const overscanRowCount = 10;
const rowHeight = 30;

class NominationDetails extends React.Component {

  static propTypes = {
    ballots: React.PropTypes.instanceOf(List),
    canon: React.PropTypes.instanceOf(Map).isRequired,
    category: React.PropTypes.string.isRequired,
    classify: React.PropTypes.func.isRequired,
    fetchBallots: React.PropTypes.func.isRequired,
    nominations: React.PropTypes.instanceOf(List).isRequired,
    onRequestClose: React.PropTypes.func.isRequired,
    selected: React.PropTypes.instanceOf(Map),
    updateCanonEntry: React.PropTypes.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const { ballots, category, fetchBallots, nominations, onRequestClose, selected } = nextProps;
    if (selected) {
      if (nominations.size === 0) {
        // TODO: remove canonicalisation here
        onRequestClose();
      } else if (!ballots) {
        fetchBallots(category);
      }
    }
  }

  removeNomination(nomination) {
    const { canon, category, classify, nominations } = this.props;
    classify(category, [nomination], null);
    if (canon.equals(nomination)) {
      const ce = nominations.filterNot(nom => nom.equals(nomination)).first();
      if (ce) this.setCanonicalEntry(ce);
    }
  }

  setCanonicalEntry(nomination) {
    const { category, selected, updateCanonEntry } = this.props;
    const canonId = selected.get('canon_id');
    updateCanonEntry(canonId, category, nomination);
  }

  render() {
    const { ballots, canon, category, nominations, onRequestClose, selected } = this.props;
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
              onRowClick={ ({ index }) => this.setCanonicalEntry(nominations.get(index)) }
              overscanRowCount={overscanRowCount}
              rowClassName={ ({ index }) => canon.equals(nominations.get(index)) ? 'canon-entry' : '' }
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
                cellRenderer={ ({ rowData }) => <ContentClear
                  className='drop-nom'
                  onClick={ (ev) => {
                    this.removeNomination(rowData);
                    ev.stopPropagation();
                  } }
                  style={{ cursor: 'pointer' }}
                /> }
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
      canon: Map(),
      nominations: List()
    }
    const canonId = selected.get('canon_id');
    return {
      ballots: hugoAdmin.getIn(['ballots', category]),
      canon: canonId && hugoAdmin.getIn(['canon', category, canonId]) || Map(),
      nominations: canonId && (
        hugoAdmin.getIn(['nominations', category])
          .filter(nom => nom.get('canon_id') === canonId)
          .map(nom => nom.get('data'))
      ) || List.of(selected.get('data'))
    }
  }, {
    classify,
    fetchBallots,
    updateCanonEntry
  }
)(NominationDetails);
