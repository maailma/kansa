import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { AutoSizer, Column, Table } from 'react-virtualized'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import ContentClear from 'material-ui/svg-icons/content/clear'
import DisqualifyChecked from 'material-ui/svg-icons/navigation/cancel'
import DisqualifyUnchecked from 'material-ui/svg-icons/toggle/radio-button-unchecked'

import { nominationFields } from '../../hugo/constants'
import { classify, fetchAllBallots, updateCanonEntry } from '../actions'
import { countRawBallots } from '../nomination-count';
import './NominationDetails.css'

const headerHeight = 30;
const overscanRowCount = 10;
const rowHeight = 30;

class NominationDetails extends React.Component {

  static propTypes = {
    ballots: React.PropTypes.instanceOf(Map),
    canon: React.PropTypes.instanceOf(Map).isRequired,
    classify: React.PropTypes.func.isRequired,
    fetchAllBallots: React.PropTypes.func.isRequired,
    nominations: React.PropTypes.instanceOf(List).isRequired,
    selected: React.PropTypes.instanceOf(Map),
    setSelected: React.PropTypes.func.isRequired,
    updateCanonEntry: React.PropTypes.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const { ballots, fetchAllBallots, nominations, selected, setSelected } = nextProps;
    if (selected) {
      if (nominations.isEmpty()) {
        // TODO: remove canonicalisation here
        setSelected(null);
      } else if (ballots.isEmpty()) {
        fetchAllBallots();
      }
    }
  }

  get canonId() {
    const { selected } = this.props;
    return selected && selected.get('canon_id');
  }

  get category() {
    const { selected } = this.props;
    return selected && selected.get('category');
  }

  get columns() {
    const { ballots } = this.props;
    const count = <Column
      cellDataGetter={ ({ rowData }) => {
        if (!ballots || ballots.isEmpty()) return '';
        const category = rowData.get('category');
        return countRawBallots(ballots.get(category), rowData.get('data'));
      } }
      dataKey='count'
      key='count'
      label='#'
      width={20}
    />;
    const cat = <Column
      cellDataGetter={ ({ rowData }) => {
        const category = rowData.get('category');
        const cm = category && category.match(/^(..).*(Long|Short)$/);
        return cm ? cm[1] + cm[2] : category;
      } }
      dataKey='category'
      key='category'
      label='Category'
      width={80}
    />;
    const data = this.fields.map(key => (
      <Column
        cellDataGetter = { ({ dataKey, rowData }) => rowData.getIn(['data', dataKey]) }
        dataKey={key}
        flexGrow={1}
        key={key}
        label={key}
        width={100}
      />
    ));
    const remove = <Column
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
      key='drop'
      label=''
      width={20}
    />;
    return [ count, cat, ...data, remove ];
  }

  get disqualified() {
    const { canon } = this.props;
    return canon.get('disqualified', false);
  }

  set disqualified(dq) {
    const { canon, updateCanonEntry } = this.props;
    updateCanonEntry(this.canonId, this.category, canon.set('disqualified', dq));
  }

  get fields() {
    const { nominations } = this.props;
    const fields = {};
    const seen = {};
    nominations.forEach(nom => {
      const category = nom.get('category');
      if (seen[category]) return;
      nominationFields(category).forEach(f => fields[f] = true);
      seen[category] = true;
    });
    return Object.keys(fields);
  }

  removeNomination(nomination) {
    const { canon, classify, nominations } = this.props;
    const category = nomination.get('category');
    const data = nomination.get('data');
    classify(category, [data], null);
    if (category === this.category && canon.get('data').equals(data)) {
      let index = nominations.findIndex(nom => !nom.equals(nomination) && nom.get('category') === category);
      if (index === -1) index = nominations.findIndex(nom => !nom.equals(nomination));
      if (index !== -1) this.setCanonicalEntry({ index });
    }
  }

  render() {
    const { nominations, selected, setSelected } = this.props;
    const disqualified = this.disqualified;
    return <Dialog
      actions={
        <FlatButton
          icon={ disqualified ? <DisqualifyChecked /> : <DisqualifyUnchecked />}
          label='Disqualified'
          labelPosition='after'
          onTouchTap={ () => this.disqualified = !disqualified }
          secondary={disqualified}
          style={ disqualified ? {} : { color: 'rgba(0, 0, 0, 0.6)' } }
        />
      }
      onRequestClose={() => setSelected(null)}
      open={!!selected}
      actionsContainerStyle={ disqualified ? {
        background: 'rgba(0, 0, 0, 0.8)'
      } : {} }
      bodyStyle={ disqualified ? {
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white'
      } : {} }
    >
      <div style={{ height: '60vh' }}>
        <AutoSizer>
          { ({ height, width }) => (
            <Table
              headerHeight={headerHeight}
              height={height}
              onRowClick={this.setCanonicalEntry}
              overscanRowCount={overscanRowCount}
              rowClassName={this.rowClassName}
              rowCount={nominations.size}
              rowGetter={({ index }) => nominations.get(index)}
              rowHeight={rowHeight}
              width={width}
            >
              { this.columns }
            </Table>
          ) }
        </AutoSizer>
      </div>
    </Dialog>
  }

  rowClassName = ({ index }) => {
    const { canon, nominations } = this.props;
    const nomination = nominations.get(index);
    const isCanon = nomination &&
      this.category === nomination.get('category') &&
      canon.get('data').equals(nomination.get('data'));
    return isCanon ? 'canon-entry' : '';
  }

  setCanonicalEntry = ({ index }) => {
    const { canon, nominations, setSelected, updateCanonEntry } = this.props;
    const nomination = nominations.get(index);
    const category = nomination.get('category');
    updateCanonEntry(this.canonId, category, canon.set('data', nomination.get('data')));
    setSelected(nomination);
  }

}

export default connect(
  ({ hugoAdmin }, { selected }) => {
    const ballots = hugoAdmin.get('ballots');
    if (!Map.isMap(selected)) return {
      ballots,
      canon: Map(),
      nominations: List()
    };
    const canonId = selected.get('canon_id');
    const category = selected.get('category');
    return canonId ? {
      ballots,
      canon: hugoAdmin.getIn(['canon', category, canonId]) || Map(),
      nominations: hugoAdmin
        .get('nominations')
        .map(nominations => nominations.filter(nom => nom.get('canon_id') === canonId))
        .valueSeq()
        .flatten(true)
        .toList()
    } : {
      ballots,
      canon: Map(),
      nominations: List.of(selected)
    };
  }, {
    classify,
    fetchAllBallots,
    updateCanonEntry
  }
)(NominationDetails);
