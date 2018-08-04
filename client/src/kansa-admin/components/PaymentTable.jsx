import { List } from 'immutable'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { AutoSizer, Column, SortDirection, Table } from 'react-virtualized'

import filterPeople from '../filterPeople'
import styles from '../styles/MemberTable.css'

const noRowsRenderer = () => <div className={styles.noRows}>Loading...</div>

class PaymentTable extends PureComponent {
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
      .update(
        list => (sortDirection === SortDirection.DESC ? list.reverse() : list)
      )

    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
        <div style={{ flex: '1 1 auto' }}>
          <AutoSizer>
            {({ height, width }) => (
              <Table
                key="table"
                headerClassName={styles.headerColumn}
                headerHeight={headerHeight}
                height={height}
                noRowsRenderer={noRowsRenderer}
                overscanRowCount={overscanRowCount}
                rowHeight={rowHeight}
                rowGetter={({ index }) => list.get(index)}
                rowCount={list.size}
                scrollToIndex={scrollToIndex}
                sort={({ sortBy, sortDirection }) =>
                  this.setState({ sortBy, sortDirection })
                }
                sortBy={sortBy}
                sortDirection={sortDirection}
                width={width}
                onRowClick={({ index }) =>
                  this.props.onPaymentSelect(list.get(index))
                }
              >
                <Column
                  dataKey="updated"
                  label="Mod"
                  width={100}
                  cellDataGetter={({ rowData }) => {
                    const ts = rowData.get('updated') || rowData.get('created')
                    return ts.slice(0, ts.indexOf('T'))
                  }}
                />
                <Column dataKey="status" label="Status" width={80} />
                <Column
                  dataKey="amount"
                  label="€"
                  width={50}
                  cellDataGetter={({ rowData }) => {
                    let amount = rowData.get('amount') / 100
                    const currency = rowData.get('currency', '').toUpperCase()
                    if (currency && currency !== 'EUR') amount += ' ' + currency
                    return amount
                  }}
                />
                <Column
                  dataKey="payment_email"
                  label="From"
                  width={120}
                  flexGrow={1}
                />
                <Column
                  dataKey="person_name"
                  label="Beneficiary"
                  width={120}
                  flexGrow={1}
                />
                <Column
                  dataKey="category"
                  label="Category"
                  width={100}
                  flexGrow={1}
                />
                <Column dataKey="type" label="Type" width={80} flexGrow={1} />
              </Table>
            )}
          </AutoSizer>
        </div>
      </div>
    )
  }
}

export default connect(({ payments }, { filter }) => ({
  list: filterPeople(payments, filter)
}))(PaymentTable)
