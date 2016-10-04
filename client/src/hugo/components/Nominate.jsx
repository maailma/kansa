import { Map } from 'immutable'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

import Snackbar from 'material-ui/Snackbar'

import { setNominator, clearNominationError } from '../actions'
import { categoryInfo } from '../constants'

import Intro from '../../1980/Intro'
import NominationCategory from './NominationCategory'
import SaveAllButton from './SaveAllButton'
import './Nominate.css'

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

class ActiveNominations extends React.Component {

  static propTypes = {
    person: ImmutablePropTypes.map
  }

  state = {
    showMore: false
  }

  get name() {
    const { person } = this.props;
    if (!Map.isMap(person)) return '<>';
    const pna = [ person.get('public_first_name'), person.get('public_last_name') ];
    const pns = pna.filter(s => s).join(' ');
    return pns || person.get('legal_name');
  }

  render() {
    const { showMore } = this.state;
    return <div>
      <div className='NominationsHead'>
        <h2>{ 'Nominations for ' + this.name }</h2>
        <Intro
          setShowMore={ showMore => this.setState({ showMore }) }
          showMore={showMore}
        />
        { showMore ? <p>
          Thank you for participating in the 1980 Timewarp Project! We hope you enjoy thinking back to an earlier time.
        </p> : null }
      </div>
      {
        Object.keys(categoryInfo).map(category => (
          <NominationCategory category={category} key={category}/>
        ))
      }
      <SaveAllButton />
      <Messages />
    </div>;
  }

}

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
