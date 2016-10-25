import { List, Map } from 'immutable'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { AutoSizer, Column, SortDirection, Table } from 'react-virtualized'
import 'react-virtualized/styles.css'

import './CanonNominationList.css'

const noRowsRenderer = () => (
  <div>
    No nominations to list!
  </div>
);

export default class CanonNominationList extends React.Component {
  static propTypes = {
    canon: React.PropTypes.instanceOf(Map).isRequired,
    fields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    nominations: React.PropTypes.instanceOf(List).isRequired,
    onSelect: React.PropTypes.func.isRequired,
    selected: React.PropTypes.instanceOf(List).isRequired,
    style: React.PropTypes.object
  }

  static headerHeight = 30;
  static overscanRowCount = 10;
  static rowHeight = 30;

  state = {
    sortBy: 'title',
    sortDirection: SortDirection.ASC
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
    const { canon, fields, style } = this.props;
    const { sortBy, sortDirection } = this.state;

    const seenCanon = [];
    let nominations = this.props.nominations
      .filter(n => {
        if (!n) return false;
        const ci = n.get('canon_id');
        if (typeof ci === 'number' && ci >= 0) {
          if (seenCanon.indexOf(ci) !== -1) return false;
          seenCanon.push(ci);
        }
        return true;
      })
      .sortBy(n => n.get(sortBy, ''));
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
              { fields.map(key => {
                return <Column
                  cellDataGetter = { ({ dataKey, rowData }) => rowData.get(dataKey) }
                  dataKey={key}
                  flexGrow={1}
                  key={'r-'+key}
                  label={key}
                  width={100}
                />
              }) }
              { fields.map(key => {
                return <Column
                  cellDataGetter = { ({ dataKey, rowData }) => {
                    const ci = rowData.get('canon_id');
                    return ci ? canon.getIn([ci, dataKey]) : '';
                  } }
                  dataKey={key}
                  flexGrow={1}
                  key={'c-'+key}
                  label={'C:'+key}
                  width={100}
                />
              }) }
            </Table>
          ) }
        </AutoSizer>
      </div>
    )
  }
}
