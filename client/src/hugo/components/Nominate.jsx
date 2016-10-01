import { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'

import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import ListCheck from 'material-ui/svg-icons/av/playlist-add-check'
import transitions from 'material-ui/styles/transitions'
import Snackbar from 'material-ui/Snackbar'

import { setNominator, editNomination, submitNominations, resetNominations, clearNominationError } from '../actions'
import { categories, maxNominationsPerCategory, nominationFields, categoryTexts } from '../constants'
import NominationCategory from './NominationCategory'

import './Nominate.css'
import * as ImmutablePropTypes from 'react-immutable-proptypes';

const SaveAllButton = connect(
  ({ nominations }) => ({
    changedCategories: nominations.filterNot(data => data.get('clientData').equals(data.get('serverData')))
  }), {
    submitNominations
  }
)(({ changedCategories, submitNominations }) =>
  <Paper
    circle={true}
    className='SaveAllButton'
    style={{
      opacity: changedCategories.size ? 1 : 0,
      transition: transitions.easeOut(),
      visibility: changedCategories.size ? 'visible' : 'hidden'
    }}
    zDepth={2}
  >
    <IconButton
      disabled={ changedCategories.size == 0 }
      onTouchTap={ () => changedCategories.keySeq().forEach(submitNominations) }
      style={{
        transition: transitions.easeOut(),
        position: 'relative',
        height: 56,
        width: 56,
        padding: 0,
        borderRadius: '50%',
        textAlign: 'center',
        verticalAlign: 'bottom'
      }}
      tooltip='Save all categories'
      tooltipPosition='top-left'
      tooltipStyles={{
        fontSize: 12,
        right: 64,
        marginTop: 40
      }}
    >
      <ListCheck />
    </IconButton>
  </Paper>
);

const Messages = connect(
  ({ nominations }) => {
    const [ category, data ] = nominations.findEntry(data => data.get('error'), null, []);
    return {
      category,
      error: data ? data.get('error') : ''
    }
  }, {
    clearNominationError
  }
)(({ category, error, clearNominationError }) => <Snackbar
  open={ !!category }
  message={ category ? `${category}: ${error}` : '' }
  onRequestClose={ () => clearNominationError(category) }
/>);

function getName(person) {
  if (!Map.isMap(person)) return '<>';
  const pna = [ person.get('public_first_name'), person.get('public_last_name') ];
  const pns = pna.filter(s => s).join(' ');
  return pns || person.get('legal_name');
}

const ActiveNominations = ({ person }) => <div>
  <h1>{ 'Hugo nominations for ' + getName(person) }</h1>
  <p>Introduction to Hugo nominations</p>
  {
    categories.map(category => {
      const { title, description, nominationFieldLabels } = categoryTexts[category];
      const fields = nominationFields(category);
      const ConnectedNominationCategory = connect(
        (state) => ({
          state: state.nominations.get(category)
        }), {
          onChange: (idx, values) => editNomination(category, idx, values),
          onSave: () => submitNominations(category),
          onReset: () => resetNominations(category)
        }
      )(NominationCategory);
      return <div key={category}>
        <h3>{ title }</h3>
        <p>{ description }</p>
        <table>
          <thead>
            <tr>
              { fields.map(field => <th key={field}>{ nominationFieldLabels[field] || field }</th>) }
            </tr>
          </thead>
          <ConnectedNominationCategory fields={fields} maxNominations={maxNominationsPerCategory} />
        </table>
      </div>
    })
  }
  <SaveAllButton />
  <Messages />
</div>;


/*
const ReadOnlyNominations = ({ fields, state }) => {
  const values = state.get('serverData');
  return <tbody>{
    values.map((rowValues, idx) => <tr key={idx}>{
      fields.map(field => <td key={field}>{ rowValues.get(field, '') }</td>)
    }</tr>)
  }</tbody>;
}

ReadOnlyNominations.propTypes = {
  fields: React.PropTypes.array.isRequired,
  state: ImmutablePropTypes.mapContains({
    serverData: ImmutablePropTypes.list.isRequired,
  }).isRequired
};

const connectSetCategories = connect(state => ({
  setCategories: Object.keys(state.nominations).filter(category => 
    !state.nominations[category].get('serverData').isEmpty()
  )
}));

const InactiveNominations = connectSetCategories(({ setCategories }) => <div>
  <p>Hugo voting is not currently available</p>
  { setCategories.isEmpty() ? null : <p>... but here are the nominations we've got from you previously:</p> }
  {
    setCategories.map(category => getConnectedNominationForm(category, true))
  }
</div>);
*/


class Nominate extends React.Component {

  static propTypes = {
    id: React.PropTypes.number.isRequired,
    person: ImmutablePropTypes.map,
    setNominator: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    const { id, person, setNominator } = props;
    if (person && id !== person.get('id')) setNominator(person.get('id'));
  }

  componentWillReceiveProps(nextProps) {
    const { id, person, setNominator } = nextProps;
    if (person && id !== person.get('id')) setNominator(person.get('id'));
  }

  render() {
    const { person } = this.props;
    return person ? <ActiveNominations person={person}/> : <div>Loading...</div>
  }

}

export default connect(
  (state) => {
    const id = Number(state.app.get('person', -1));
    const people = state.user.get('people');
    return {
      id,
      person: !people ? null
              : id === -1 ? people.first()
              : people.find(p => p.get('id') === id)
    }
  }, {
    setNominator
  }
)(Nominate);
