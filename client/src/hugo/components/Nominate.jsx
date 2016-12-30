import { Map } from 'immutable'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

const { Col, Row } = require('react-flexbox-grid');
import Snackbar from 'material-ui/Snackbar'

import { setNominator, clearNominationError } from '../actions'
import { categoryInfo } from '../constants'

import NominationCategory from './NominationCategory'
import NominationSignature from './NominationSignature'
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

const ActiveNominations = ({ name, signature }) => <div>
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
      <p>
        Thank you for participating in the 2016 Hugo Awards and the John W. Campbell Award! Please choose up to five
        nominees in each category. We recommend that you nominate whatever works and creators you have personally read
        or seen that were your favorites from 2016.
      </p>
      <p>
        The deadline for nominations is 17 March 2017 at 2359 Pacific Daylight Time (0259 Eastern Daylight Time, 0659
        Greenwich Mean Time, 0859 in Finland, all on 18 March). You can make as many changes as you like up to your
        nomination ballot until then. Your current ballot will be emailed to you an hour after you stop making changes
        to it.
      </p>
      <p>
        Nothing has changed about the mechanics of making nominations this year. You can still choose up to five
        nominees in each category. Your nominations are equally weighted – the order in which you list them has no
        effect on the outcome. There are some changes to the way that nominations are tallied to produce the final
        ballot; they are summarised <a href="http://www.worldcon.fi/wsfs/hugo/" target="_blank">here</a>.
      </p>
      <p>
        This year we are trialling a new category, Best Series. If you make nominations for Best Series, it will help us
        if you also list a volume in that series that was published in 2016.
      </p>
      <p>
        “No Award” will appear automatically in every single category on the final ballot – there is no need to include
        that choice on the nomination form.
      </p>
      <p>
        If your nominee is not well known, please provide a source where their 2016 work in that category may be found.
        This information makes identifying the work you intend to nominate easier for us.
      </p>
      <p>
        Works published in 2016 for the first time anywhere, or for the first time in English translation, are eligible
        for the Hugo Awards being awarded in 2017. Books are considered to have been published in the year of the
        publication date, which usually appears with the copyright information on the back of the title page. If there
        is no stated publication date, the copyright date will be used instead.  A dated periodical is considered to
        have been published on the cover date, regardless of when it was placed on sale or copyrighted.  Serialized
        stories or dramatic presentations are eligible in the year in which the last installment appears.
      </p>
      <p>
        Nominations in the written fiction and dramatic presentation categories may be relocated to a different category
        by the Hugo Awards Administrator if close in length to the category boundary.
      </p>
      <p>
        If you have difficulties accessing the online ballot, or you have more general questions on the Hugo process,
        you can e-mail <a href="mailto:hugohelp@worldcon.fi">hugohelp@worldcon.fi</a> for assistance. See <a
          href="http://www.worldcon.fi/wsfs/hugo/" target="_blank"
        >here</a> for more information about the Hugo Awards. The full rules for the Hugo Awards are contained in the <a
          href="http://www.wsfs.org/wp-content/uploads/2016/10/WSFS-Constitution-as-of-August-22-2016.pdf"
          target="_blank"
        >WSFS constitution</a>.
      </p>
      <p>
        We look forward to receiving your nominations.
      </p>


    </Col>
  </Row>
  <Row>
    <Col
      xs={10} xsOffset={1}
      lg={8} lgOffset={2}
    >{
      Object.keys(categoryInfo).map(category => (
        <NominationCategory signature={signature} category={category} key={category}/>
      ))
    }</Col>
  </Row>
  <SaveAllButton signature={signature} />
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
    this.state = { signature: '' };
  }

  componentWillReceiveProps(nextProps) {
    const { id, person, setNominator } = nextProps;
    if (person && id !== person.get('id')) setNominator(person.get('id'));
  }

  render() {
    const { id, person } = this.props;
    const { signature } = this.state;
    return !id ? <div>Loading...</div>
      : !person ? <div>Nominator not found!</div>
      : <div>
          <ActiveNominations name={this.name} signature={signature} />
          { signature ? null : <NominationSignature
            setName={ signature => this.setState({ signature }) }
          /> }
        </div>;
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
  ({ app, user }, { params }) => {
    const id = params && Number(params.id);
    const people = user.get('people');
    return {
      id: app.get('person'),
      person: people && people.find(p => p.get('id') === id)
    }
  }, {
    setNominator
  }
)(Nominate);
