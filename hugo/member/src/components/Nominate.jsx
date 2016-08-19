import React from 'react'
import { connect } from 'react-redux'

import FloatingActionButton from 'material-ui/FloatingActionButton'
import ListCheck from 'material-ui/svg-icons/av/playlist-add-check'
import Snackbar from 'material-ui/Snackbar'

import { editNomination, submitNominations, resetNominations, clearNominationError } from '../actions'
import { categories, maxNominationsPerCategory, nominationFields, categoryTexts } from '../hugoinfo'
import NominationForm from './NominationForm'

import './Nominate.css'

const SaveAllButton = connect(
  ({ nominations }) => ({
    changedCategories: nominations.filterNot(data => data.get('clientData').equals(data.get('serverData'))).keySeq()
  }), {
    submitNominations
  }
)(({ changedCategories, submitNominations }) =>
  <FloatingActionButton
    className='SaveAllButton'
    disabled={ changedCategories.size == 0 }
    onTouchTap={ () => changedCategories.forEach(submitNominations) }
  >
    <ListCheck />
  </FloatingActionButton>
);

const ErrorMessages = connect(
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

const ActiveNominations = () => <div>
  <p>Introduction to Hugo nominations</p>
  {
    categories.map(category => {
      const { title, description, nominationFieldLabels } = categoryTexts[category];
      const fields = nominationFields(category);
      const ConnectedNominationForm = connect(
        (state) => ({
          state: state.nominations.get(category)
        }), {
          onChange: (idx, values) => editNomination(category, idx, values),
          onSave: () => submitNominations(category),
          onReset: () => resetNominations(category)
        }
      )(NominationForm);
      return <div key={category}>
        <h3>{ title }</h3>
        <p>{ description }</p>
        <table>
          <thead>
            <tr>
              { fields.map(field => <th key={field}>{ nominationFieldLabels[field] || field }</th>) }
            </tr>
          </thead>
          <ConnectedNominationForm fields={fields} maxNominations={maxNominationsPerCategory} />
        </table>
      </div>
    })
  }
  <SaveAllButton />
  <ErrorMessages />
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


const NominationsNotAllowed = () => <div>
  <p>Unfortunately, it looks like you don't have the right to nominate for the Hugo Awards.</p>
</div>;


const Nominate = ({ nominator }) => nominator ? <ActiveNominations /> : <NominationsNotAllowed />;

export default ActiveNominations;
/*
export default connect(state => ({
  nominator: !!state.person.get('can_hugo_nominate'),
  person: state.person.toJS()
}))(Nominate);
*/
