import { Map } from 'immutable'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

const { Col, Row } = require('react-flexbox-grid');
import Snackbar from 'material-ui/Snackbar'

import { setNominator, clearNominationError } from '../actions'
import { categoryInfo } from '../constants'

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

const ActiveNominations = ({ name }) => <div>
  <Row>
    <Col
      xs={10} xsOffset={1}
      lg={8} lgOffset={2}
      style={{ paddingTop: 20 }}
    >
      <h1>{ 'Hugo nominations for ' + name }</h1>
    </Col>
    <Col
      xs={10} xsOffset={1}
      sm={8} smOffset={2}
      lg={6} lgOffset={3}
    >
      <p>Introduction to Hugo nominations</p>
    </Col>
  </Row>
  <Row>
    <Col
      xs={10} xsOffset={1}
      lg={8} lgOffset={2}
    >{
      Object.keys(categoryInfo).map(category => (
        <NominationCategory category={category} key={category}/>
      ))
    }</Col>
  </Row>
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
    return person ? <ActiveNominations name={this.name} /> : <div>Loading...</div>
  }

  get name() {
    const { person } = this.props;
    if (!Map.isMap(person)) return '<>';
    const pna = [person.get('public_first_name'), person.get('public_last_name')];
    const pns = pna.filter(s => s).join(' ');
    return pns || person.get('legal_name');
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
