import { Iterable, List } from 'immutable'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { AutoSizer, Column, Table } from 'react-virtualized'
import 'react-virtualized/styles.css'

import { nominationFields } from '../../hugo-nominations/constants'

export default class Results extends PureComponent {
  static propTypes = {
    category: PropTypes.string.isRequired,
    log: PropTypes.instanceOf(List).isRequired,
    results: PropTypes.instanceOf(Iterable).isRequired,
    style: PropTypes.object
  }

  static headerHeight = 30;
  static overscanRowCount = 10;
  static rowHeight = 30;

  get columns () {
    const { category } = this.props
    const points = <Column
      dataKey='points'
      key='points'
      label='Pts'
      width={40}
    />
    const nominations = <Column
      dataKey='nominations'
      key='nominations'
      label='Nominations'
      width={30}
    />
    const round = <Column
      dataKey='round'
      key='round'
      label='#'
      width={30}
    />
    const data = nominationFields(category).map(key => <Column
      dataKey={key}
      flexGrow={1}
      key={key}
      label={key}
      width={100}
    />)
    return [points, nominations, round, ...data]
  }

  get list () {
    const { log, results } = this.props
    return log.reduceRight((list, entry, idx) => list.concat(
      entry.get('next').map(nom => nom
        .merge(entry.getIn(['counts', nom]))
        .set('round', 1 + idx)
      )
    ), results
      .map(nom => nom
        .merge(log.last().getIn(['counts', nom]))
        .set('round', '*')
      )
      .sortBy(nom => -nom.get('points'))
    ).toList()
  }

  render () {
    const { style } = this.props
    const list = this.list
    return (
      <div
        style={style}
      >
        <AutoSizer>
          { ({ height, width }) => (
            <Table
              headerHeight={Results.headerHeight}
              height={height}
              overscanRowCount={Results.overscanRowCount}
              rowClassName={({ index }) => this.rowClassName(list, index)}
              rowHeight={Results.rowHeight}
              rowGetter={({ index }) => list.get(index)}
              rowCount={list.size}
              width={width}
            >
              { this.columns }
            </Table>
          ) }
        </AutoSizer>
      </div>
    )
  }

  rowClassName = (list, index) => {
    const round = list.getIn([index, 'round'])
    return round === '*' ? 'finalist' : ''
  }
}
