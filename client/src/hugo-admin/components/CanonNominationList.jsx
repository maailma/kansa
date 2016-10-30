import { List, Map } from 'immutable'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { AutoSizer, Column, SortDirection, Table } from 'react-virtualized'
import 'react-virtualized/styles.css'
import More from 'material-ui/svg-icons/navigation/more-horiz'

import './CanonNominationList.css'
import { countRawBallots } from '../nomination-count';

const noRowsRenderer = () => (
  <div>
    No nominations to list!
  </div>
);

export default class CanonNominationList extends React.Component {
  static propTypes = {
    ballots: React.PropTypes.instanceOf(List),
    canon: React.PropTypes.instanceOf(Map).isRequired,
    fields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    nominations: React.PropTypes.instanceOf(List).isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onShowDetails: React.PropTypes.func.isRequired,
    query: React.PropTypes.string,
    selected: React.PropTypes.instanceOf(List).isRequired,
    style: React.PropTypes.object
  }

  static headerHeight = 30;
  static overscanRowCount = 10;
  static rowHeight = 30;

  state = {
    sortBy: '',
    sortDirection: SortDirection.ASC
  }

  ballotCount(nomination) {
    const { ballots, nominations } = this.props;
    if (!ballots || !nomination) return 0;
    const ci = nomination.get('canon_id');
    if (ci) {
      return nominations.reduce((sum, nom) => {
        if (nom.get('canon_id') === ci) {
          sum += countRawBallots(ballots, nom.get('data'));
        }
        return sum;
      }, 0);
    } else {
      return countRawBallots(ballots, nomination.get('data'));
    }
  }

  onRowClick = (list) => ({ index }) => {
    this.props.onSelect(list.get(index));
    this.setState({ hoverPos: index });
  }

  rowClassName = (nominations, index) => {
    const nom = index >= 0 && nominations.get(index);
    return nom && this.props.selected.includes(nom) ? 'selected' : '';
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    const { ballots, canon, fields, onShowDetails, query, style } = this.props;
    const { sortBy, sortDirection } = this.state;

    const seenCanon = [];
    let nominations = this.props.nominations
      .filter(n => {
        if (!n) return false;
        if (query) {
          if (n.every(v => String(v).toLowerCase().indexOf(query) === -1)) return false;
        }
        const ci = n.get('canon_id');
        if (ci) {
          if (seenCanon.indexOf(ci) !== -1) return false;
          seenCanon.push(ci);
        }
        return true;
      })
      .map(n => {
        const ci = n.get('canon_id');
        return ci ? n.set('data', canon.get(ci)) : n;
      })
      .sortBy(n => sortBy === 'ballotCount'
        ? this.ballotCount(n)
        : n.getIn(['data', sortBy], '').toLowerCase()
      );
    if (sortDirection === SortDirection.DESC) nominations = nominations.reverse();

    return (
      <div
        onKeyDown={this.onKeyDown}
        style={style}
      >
        <AutoSizer>
          { ({ height, width }) => (
            <Table
              headerHeight={CanonNominationList.headerHeight}
              height={height}
              noRowsRenderer={noRowsRenderer}
              onRowClick={this.onRowClick(nominations)}
              overscanRowCount={CanonNominationList.overscanRowCount}
              rowClassName={({ index }) => this.rowClassName(nominations, index)}
              rowHeight={CanonNominationList.rowHeight}
              rowGetter={({ index }) => nominations.get(index)}
              rowCount={nominations.size}
              sort={({ sortBy, sortDirection }) => this.setState({ sortBy, sortDirection })}
              sortBy={sortBy}
              sortDirection={sortDirection}
              width={width}
            >
              <Column
                cellRenderer={ ({ cellData, rowData }) => {
                  return cellData ? <More
                    onClick={ (ev) => {
                      onShowDetails(rowData);
                      ev.stopPropagation();
                    } }
                  /> : '';
                } }
                dataKey='canon_id'
                style={{ display: 'flex' }}
                width={20}
              />
              {
                ballots ? <Column
                  cellDataGetter = { ({ rowData }) => this.ballotCount(rowData) }
                  dataKey='ballotCount'
                  label='#'
                  width={30}
                /> : null
              }
              {
                fields.map(key => <Column
                  cellDataGetter = { ({ dataKey, rowData }) => rowData.getIn(['data', dataKey]) }
                  dataKey={key}
                  flexGrow={1}
                  key={key}
                  label={key}
                  width={100}
                />)
              }
            </Table>
          ) }
        </AutoSizer>
      </div>
    )
  }
}
