import { Map } from 'immutable'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

const { Col, Row } = require('react-flexbox-grid');
import Snackbar from 'material-ui/Snackbar'

import { setScene } from '../../app/actions/app'
import { categoryInfo } from '../../hugo-nominations/constants'

import VoteCategory from './VoteCategory'
import VoteIntro from './VoteIntro'
import VoteSignature from './VoteSignature'
//import './Nominate.css'

/*
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
*/

class Vote extends React.Component {

  static propTypes = {
    id: React.PropTypes.number.isRequired,
    person: ImmutablePropTypes.map,
    setScene: React.PropTypes.func.isRequired
  }

  state = {
    signature: ''
  };

  componentDidMount() {
    this.props.setScene({ title: 'Hugo Votes', dockSidebar: false });
  }

  render() {
    const { id, person } = this.props;
    const { signature } = this.state;
    const active = person.get('can_hugo_vote');
    if (!id || !person) return <div>Voter not found!</div>;
    return (
      <div>
        <VoteIntro active={active} name={this.name} />
        <VoteSignature
          signature={signature}
          setSignature={signature => this.setState({ signature })}
        />
        {signature ? (
          <Row>
            <Col
              xs={12}
              md={10} mdOffset={1}
              lg={8} lgOffset={2}
            >
              {Object.keys(categoryInfo).map(category => (
                <VoteCategory
                  active={active}
                  category={category}
                  key={category}
                  signature={signature}
                />
              ))}
            </Col>
          </Row>
        ) : null}
      </div>
    );
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
    setScene
  }
)(Vote);
