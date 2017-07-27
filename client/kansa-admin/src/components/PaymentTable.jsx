import { List } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { connect } from 'react-redux'
import { AutoSizer, FlexTable, FlexColumn, SortDirection } from 'react-virtualized'

import filterPeople from '../filterPeople'
import styles from '../styles/MemberTable.css'

const noRowsRenderer = () => (
  <div className={styles.noRows}>
    Loading...
  </div>
);

class PaymentTable extends React.Component {
  static propTypes = {
    list: PropTypes.instanceOf(List).isRequired,
    onPaymentSelect: PropTypes.func.isRequired
  }

  state = {
    headerHeight: 30,
    overscanRowCount: 10,
    rowHeight: 30,
    scrollToIndex: undefined,
    sortBy: 'updated',
    sortDirection: SortDirection.DESC
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
      .sortBy(item => item.get(sortBy, ''))
      .update(list => sortDirection === SortDirection.DESC ? list.reverse() : list)

    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
        <div style={{ flex: '1 1 auto' }}>
          <AutoSizer>
            { ({ height, width }) => (
              <FlexTable
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
                onRowClick={ ({ index }) => this.props.onPaymentSelect(list.get(index)) }
              >
                <FlexColumn dataKey='updated' label='Mod' width={100}
                  cellDataGetter = {({ rowData }) => {
                    const ts = rowData.get('updated') || rowData.get('created')
                    return ts.slice(0, ts.indexOf('T'))
                  }}
                />
                <FlexColumn dataKey='status' label='Status' width={80} />
                <FlexColumn dataKey='amount' label='€' width={50}
                  cellDataGetter = {({ rowData }) => {
                    let amount = rowData.get('amount') / 100
                    const currency = rowData.get('currency', '').toUpperCase()
                    if (currency && currency !== 'EUR') amount += ' ' + currency
                    return amount
                  }}
                />
                <FlexColumn dataKey='payment_email' label='From' width={120} flexGrow={1} />
                <FlexColumn dataKey='person_name' label='Beneficiary' width={120} flexGrow={1} />
                <FlexColumn dataKey='category' label='Category' width={100} flexGrow={1} />
                <FlexColumn dataKey='type' label='Type' width={80} flexGrow={1} />
              </FlexTable>
            ) }
          </AutoSizer>
        </div>
      </div>
    )
  }
}

export default connect(
  ({ payments }, { filter }) => ({
    list: filterPeople(payments, filter)
  })
)(PaymentTable)
