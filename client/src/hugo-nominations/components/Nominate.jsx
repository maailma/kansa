import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

const { Col, Row } = require('react-flexbox-grid');
import Snackbar from 'material-ui/Snackbar'

import { setScene } from '../../app/actions/app'
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


const NominationsHead = ({ active, name, signature }) => (
  <Row className="bg-text">
    <Col
      xs={10} xsOffset={1}
      lg={8} lgOffset={2}
      style={{ paddingTop: 20 }}
    >
      <h1>{ 'Hugo nominations for ' + name }</h1>
      { signature ? <h3 style={{ marginTop: -20 }}>Signing as "{signature}"</h3> : null }
    </Col>
    <Col
      xs={10} xsOffset={1}
      sm={8} smOffset={2}
      lg={6} lgOffset={3}
    >
      { !active ? <p style={{ borderBottom: '1px solid gray', fontWeight: 'bold', marginBottom: '2em', paddingBottom: '2em' }}>
        At this time Hugo nominations have closed. We are working to compile the final ballot in each category and
        will announce the results in the first week of April.
      </p> : null }
      <p>
        Thank you for participating in the 2017 Hugo Awards and the John W. Campbell Award! Please choose up to five
        eligible candidates in each category. We recommend that you nominate whatever works and creators you have
        personally read or seen that were your favorites from 2016.
      </p>
      <p>
        The deadline for nominations is 17 March 2017 at 11:59pm Pacific Daylight Time (2:59pm Eastern Daylight Time,
        0659 Greenwich Mean Time, 0859 in Finland, all on 18 March). You can make as many changes as you like up to your
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
        if you also list a volume in that series that was published in 2016. Likewise, it will help us if you can give
        examples of the work of people you nominate for Best Professional Artist, Best Fan Artist and Best fan Writer.
      </p>
      <p>
        “No Award” will appear automatically in every single category on the final ballot – there is no need to include
        that choice on the nomination form.
      </p>
      <p>
        Works published in 2016 for the first time anywhere, or for the first time in English translation or in the
        United States, are eligible for the 2017 Hugo Awards. Books are considered to have been published in the year of
        the publication date, which usually appears with the copyright information on the back of the title page. If
        there is no stated publication date, the copyright date will be used instead. A dated periodical is considered
        to have been published on the cover date, regardless of when it was placed on sale or copyrighted. Serialized
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
      { active ? <p>
        We look forward to receiving your nominations.
      </p> : null }
    </Col>
  </Row>
);


class Nominate extends React.Component {

  static propTypes = {
    id: PropTypes.number.isRequired,
    person: ImmutablePropTypes.map,
    setNominator: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired
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

  componentDidMount() {
    this.props.setScene({ title: 'Hugo Nominations', dockSidebar: false });
  }

  render() {
    const { id, person } = this.props;
    const { signature } = this.state;
    const active = person.get('can_hugo_nominate');
    return !id ? <div>Loading...</div>
      : !person ? <div>Nominator not found!</div>
      : <div>
          <NominationsHead active={active} name={this.name} signature={signature} />
          <Row>
            <Col
              xs={10} xsOffset={1}
              lg={8} lgOffset={2}
            >
              { Object.keys(categoryInfo).map(category => (
                <NominationCategory
                  active={active}
                  category={category}
                  key={category}
                  signature={signature}
                />
              )) }
            </Col>
          </Row>
          { active ? <SaveAllButton signature={signature} /> : null }
          <NominationSignature
            open={active && !signature}
            setName={ signature => this.setState({ signature }) }
          />
          <Messages />
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
    setNominator,
    setScene
  }
)(Nominate);
