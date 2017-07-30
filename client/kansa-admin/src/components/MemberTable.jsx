import { List } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { connect } from 'react-redux'
import { AutoSizer, Column, SortDirection, Table } from 'react-virtualized'

import filterPeople from '../filterPeople'
import styles from '../styles/MemberTable.css'

const publicName = (person) => ['public_first_name', 'public_last_name']
  .map(k => person.get(k))
  .join(' ')
  .trim();

const publicSortName = (person) => ['public_last_name', 'public_first_name']
  .map(k => person.get(k))
  .filter(v => !!v)
  .join(';');

const fullLocation = (person) => ['country', 'state', 'city']
  .map(k => person.get(k))
  .filter(v => !!v)
  .join(', ');

const noRowsRenderer = () => (
  <div className={styles.noRows}>
    Loading...
  </div>
);

class MemberTable extends React.Component {
  static propTypes = {
    list: PropTypes.instanceOf(List).isRequired,
    onMemberSelect: PropTypes.func.isRequired
  }

  state = {
    headerHeight: 30,
    overscanRowCount: 10,
    rowHeight: 30,
    scrollToIndex: undefined,
    sortBy: 'id',
    sortDirection: SortDirection.ASC
  }

  get sortFn() {
    const { sortBy } = this.state;
    switch (sortBy) {
      case 'public_name':  return publicSortName;
      case 'loc':          return fullLocation;
      default:             return item => item.get(sortBy, '');
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    const {
      headerHeight,
      overscanRowCount,
      rowHeight,
      scrollToIndex,
      sortBy,
      sortDirection
    } = this.state

    const list = this.props.list
      .filter(item => item)
      .sortBy(this.sortFn)
      .update(list => sortDirection === SortDirection.DESC ? list.reverse() : list)

    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
        <div style={{ flex: '1 1 auto' }}>
          <AutoSizer>
            { ({ height, width }) => (
              <Table
                key='table'
                headerClassName={styles.headerColumn}
                headerHeight={headerHeight}
                height={height}
                noRowsRenderer={noRowsRenderer}
                overscanRowCount={overscanRowCount}
                rowHeight={rowHeight}
                rowGetter={({ index }) => list.get(index)}
                rowCount={list.size}
                scrollToIndex={scrollToIndex}
                sort={({ sortBy, sortDirection }) => this.setState({ sortBy, sortDirection })}
                sortBy={sortBy}
                sortDirection={sortDirection}
                width={width}
                onRowClick={ ({ index }) => this.props.onMemberSelect(list.get(index)) }
              >
                <Column dataKey='member_number' label='#' width={50} />
                <Column dataKey='membership' label='Type' width={80} />
                <Column dataKey='legal_name' label='Name' width={120} flexGrow={1} />
                <Column dataKey='email' label='Email' width={210} />
                <Column dataKey='public_name' label='Public' width={120} flexGrow={1}
                  cellDataGetter = { ({ rowData }) => publicName(rowData) }
                />
                <Column dataKey='loc' label='Location' width={120} flexGrow={1}
                  cellDataGetter = { ({ rowData }) => fullLocation(rowData) }
                />
                <Column dataKey='last_modified' label='Mod' width={90}
                  cellDataGetter = { ({ dataKey, rowData }) => rowData.get(dataKey).substr(0,10) }
                />
              </Table>
            ) }
          </AutoSizer>
        </div>
      </div>
    )
  }
}

export default connect(
  ({ people }, { filter }) => ({
    list: filterPeople(people, filter)
  })
)(MemberTable)
