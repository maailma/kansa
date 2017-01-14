import { List, Map, Seq } from 'immutable'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { connect } from 'react-redux'
import { AutoSizer, Column, SortDirection, Table } from 'react-virtualized'
import 'react-virtualized/styles.css'
import More from 'material-ui/svg-icons/navigation/more-horiz'

import { nominationFields } from '../../hugo/constants'
import { countRawBallots } from '../nomination-count'
import './CanonNominationList.css'

class CanonNominationList extends React.Component {
  static propTypes = {
    ballots: React.PropTypes.instanceOf(Seq).isRequired,
    canon: React.PropTypes.instanceOf(Map).isRequired,
    categories: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    nominations: React.PropTypes.instanceOf(Seq).isRequired,
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

  get columns() {
    const { ballots, categories, onShowDetails } = this.props;
    const controls = [<Column
      cellRenderer={
        ({ cellData, rowData }) => cellData ? <More
          onClick={ (ev) => {
            onShowDetails(rowData);
            ev.stopPropagation();
          } }
        /> : ''
      }
      dataKey='canon_id'
      key='canon_id'
      style={{ display: 'flex' }}
      width={20}
    />];
    if (!ballots.isEmpty()) controls.push(<Column
      cellDataGetter={ ({ rowData }) => this.ballotCount(rowData) || '' }
      dataKey='ballotCount'
      key='ballotCount'
      label='#'
      width={30}
    />);
    if (categories.length > 1) controls.push(<Column
      cellDataGetter={ ({ rowData }) => {
        const category = rowData.get('category');
        const cm = category && category.match(/^(..).*(Long|Short)$/);
        return cm ? cm[1] + cm[2] : category;
      } }
      dataKey='category'
      key='category'
      label='Category'
      width={80}
    />);
    return controls.concat(nominationFields(categories).map(key => <Column
      cellDataGetter = { ({ dataKey, rowData }) => rowData.getIn(['data', dataKey]) }
      dataKey={key}
      flexGrow={1}
      key={key}
      label={key}
      width={100}
    />));
  }

  get list() {
    const { canon, nominations, query } = this.props;
    const seenCanon = [];
    return nominations
      .filter(nom => {
        if (!nom) return false;
        if (query) {
          if (nom.every(v => String(v).toLowerCase().indexOf(query) === -1)) return false;
        }
        const ci = nom.get('canon_id');
        if (ci) {
          if (seenCanon.indexOf(ci) !== -1) return false;
          const nc = nom.get('category');
          if (!canon.hasIn([nc, ci])) return false;
          seenCanon.push(ci);
        }
        return true;
      })
      .map(nom => {
        const ci = nom.get('canon_id');
        if (ci) {
          const nc = nom.get('category');
          return nom.set('data', canon.getIn([nc, ci]));
        } else {
          return nom;
        }
      });
  }

  ballotCount(nomination) {
    const { ballots, nominations } = this.props;
    if (ballots.isEmpty() || !nomination || nomination.isEmpty()) return 0;
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

  noRowsRenderer = () => (
    <div>
      Loading... Or maybe there are no nominations for { this.props.categories.join('/') }?
    </div>
  );

  onRowClick = (list) => ({ index }) => {
    this.props.onSelect(list.get(index));
    this.setState({ hoverPos: index });
  }

  rowClassName = (nominations, index) => {
    const cl = [];
    const nom = index >= 0 && nominations.get(index);
    if (nom) {
      if (nom.getIn(['data', 'disqualified'])) cl.push('disqualified');
      if (this.props.selected.includes(nom)) cl.push('selected');
    }
    return cl.join(' ');
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    const { style } = this.props;
    const { sortBy, sortDirection } = this.state;
    let list = this.list.sortBy(n => sortBy === 'ballotCount'
      ? this.ballotCount(n)
      : n.getIn(['data', sortBy], '').toLowerCase().trim()
    );
    if (sortDirection === SortDirection.DESC) list = list.reverse();
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
              noRowsRenderer={this.noRowsRenderer}
              onRowClick={this.onRowClick(list)}
              overscanRowCount={CanonNominationList.overscanRowCount}
              rowClassName={({ index }) => this.rowClassName(list, index)}
              rowHeight={CanonNominationList.rowHeight}
              rowGetter={({ index }) => list.get(index)}
              rowCount={list.size}
              sort={({ sortBy, sortDirection }) => {
                if (sortBy === 'ballotCount' && this.state.sortBy !== 'ballotCount') {
                  sortDirection = SortDirection.DESC;
                }
                this.setState({ sortBy, sortDirection })
              }}
              sortBy={sortBy}
              sortDirection={sortDirection}
              width={width}
            >
              { this.columns }
            </Table>
          ) }
        </AutoSizer>
      </div>
    )
  }
}

export default connect(
  ({ hugoAdmin }, { categories }) => ({
    ballots: hugoAdmin.get('ballots')
      .filter((_, cat) => categories.indexOf(cat) !== -1)
      .valueSeq().flatten(true),
    canon: hugoAdmin.get('canon'),
    nominations: hugoAdmin.get('nominations')
      .filter((_, cat) => categories.indexOf(cat) !== -1)
      .valueSeq(true).flatten(true)
  })
)(CanonNominationList);
