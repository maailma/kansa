import { saveAs } from 'file-saver'
import { Iterable, List, Map } from 'immutable'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FileDownload from 'material-ui/svg-icons/file/file-download'
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
    sainteLague: PropTypes.bool,
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

  csvNomineeName (nominee) {
    const { category } = this.props
    let key = 'title'
    switch (category) {
      case 'EditorLong':
      case 'EditorShort':
        key = 'editor'
        break
      case 'FanArtist':
      case 'FanWriter':
      case 'NewWriter':
      case 'ProArtist':
        key = 'author'
        break
    }
    const name = nominee.get(key, '').replace(/\s+/g, ' ').trim()
    return name.indexOf('"') === -1 && name.indexOf(',') === -1 ? name
      : '"' + name.replace(/"/g, '""') + '"'
  }

  csvPointValue (points) {
    const div = this.props.sainteLague ? 315 : 60
    return points ? (points/div).toFixed(2) : ''
  }

  download = () => {
    const { category, log } = this.props
    const map = Map(log.first().get('counts').reduce(
      (data, { nominations, points }, nominee) => data.concat([[
        nominee, {
          name: this.csvNomineeName(nominee),
          nominations,
          points: [points]
        }
      ]]), []
    ))
    log.shift().forEach(round => {
      round.get('counts').forEach(({ points }, nominee) => {
        map.get(nominee).points.push(points)
      })
    })
    const data = map.toList().toJS().sort((a, b) => {
      if (a.points.length > b.points.length) return -1
      if (a.points.length < b.points.length) return 1
      const i = a.points.length - 1
      if (a.points[i] > b.points[i]) return -1
      if (a.points[i] < b.points[i]) return 1
      if (a.nominations > b.nominations) return -1
      if (a.nominations < b.nominations) return 1
      return 0
    })
    const rounds = data[0].points.length
    const header = ['Name', 'Nominations']
    for (let i = 1; i <= rounds; ++i) header.push(i)
    const csv = [header.join(',')]
    data.forEach(({ name, nominations, points }) => {
      const row = [name, nominations]
      for (let i = 0; i < rounds; ++i) row.push(this.csvPointValue(points[i]))
      csv.push(row.join(','))
    })
    const blob = new Blob([csv.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `${category}.csv`)
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
        <FloatingActionButton
          onClick={this.download}
          style={{ position: 'fixed', bottom: 24, right: 24 }}
        >
          <FileDownload />
        </FloatingActionButton>
      </div>
    )
  }

  rowClassName = (list, index) => {
    const round = list.getIn([index, 'round'])
    return round === '*' ? 'finalist' : ''
  }
}
