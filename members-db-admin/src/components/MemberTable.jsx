/** Table of members
 *
 * Based on: https://github.com/bvaughn/react-virtualized/blob/7.7.1/source/FlexTable/FlexTable.example.js
 */

import { List } from 'immutable'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { AutoSizer, FlexTable, FlexColumn, SortDirection } from 'react-virtualized'

import styles from '../styles/MemberTable.css'

export default class MemberTable extends React.Component {
  static propTypes = {
    list: React.PropTypes.instanceOf(List).isRequired
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      headerHeight: 30,
      height: 270,
      overscanRowCount: 10,
      rowHeight: 40,
      scrollToIndex: undefined,
      sortBy: 'id',
      sortDirection: SortDirection.ASC,
      useDynamicRowHeight: false
    }

    this._noRowsRenderer = this._noRowsRenderer.bind(this)
  }

  render() {
    const {
      headerHeight,
      height,
      overscanRowCount,
      rowHeight,
      scrollToIndex,
      sortBy,
      sortDirection,
      useDynamicRowHeight
    } = this.state

    const list = this.props.list
      .filter(item => item)
      .sortBy(item => item.get(sortBy) || '')
      .update(list => sortDirection === SortDirection.DESC ? list.reverse() : list)

    return (
      <div>
        <AutoSizer disableHeight>
          {({ width }) => (
            <FlexTable
              ref='Table'
              headerClassName={styles.headerColumn}
              headerHeight={headerHeight}
              height={height}
              noRowsRenderer={this._noRowsRenderer}
              overscanRowCount={overscanRowCount}
              rowHeight={useDynamicRowHeight ? ({ index }) => list.get(index).size : rowHeight}
              rowGetter={({ index }) => list.get(index)}
              rowCount={list.size}
              scrollToIndex={scrollToIndex}
              sort={({ sortBy, sortDirection }) => { this.setState({ sortBy, sortDirection }) }}
              sortBy={sortBy}
              sortDirection={sortDirection}
              width={width}
            >
              <FlexColumn dataKey='id' label='ID' width={60} />
              <FlexColumn dataKey='legal_name' label='Name' width={90} />
              <FlexColumn dataKey='email' label='Email' width={210}
                className={styles.exampleColumn}
                cellRenderer={
                  ({ cellData, columnData, dataKey, rowData, rowIndex }) => cellData
                }
                flexGrow={1}
              />
            </FlexTable>
          )}
        </AutoSizer>
      </div>
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  _noRowsRenderer() {
    return (
      <div className={styles.noRows}>
        No rows
      </div>
    )
  }
}
