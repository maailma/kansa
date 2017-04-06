import { Map } from 'immutable'
import React, { PropTypes } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'

const { Col, Row } = require('react-flexbox-grid');
import Snackbar from 'material-ui/Snackbar'

import { setScene } from '../../app/actions/app'
import { categoryInfo } from '../../hugo-nominations/constants'
import { getFinalists, setVoter } from '../actions'
import * as VotePropTypes from '../proptypes'

import VoteCategory from './VoteCategory'
import VoteIntro from './VoteIntro'
import VoteSignature from './VoteSignature'

class Vote extends React.Component {

  static propTypes = {
    getFinalists: PropTypes.func.isRequired,
    person: ImmutablePropTypes.map,
    setScene: PropTypes.func.isRequired,
    setVoter: PropTypes.func.isRequired,
    signature: PropTypes.string,
    voterId: PropTypes.number
  }

  componentDidMount() {
    const { getFinalists, setScene } = this.props;
    getFinalists();
    setScene({ title: 'Hugo Votes', dockSidebar: false });
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps({ person, setVoter, voterId }) {
    const personId = person && person.get('id') || null;
    if (personId !== voterId) setVoter(personId, null);
  }

  render() {
    const { person, setVoter, signature } = this.props;
    const active = person.get('can_hugo_vote');
    if (!person) return <div>Voter not found!</div>;
    return (
      <div>
        <VoteIntro active={active} name={this.name} />
        <VoteSignature
          signature={signature}
          setSignature={signature => setVoter(person.get('id'), signature)}
        />
        {signature ? (
          <Row>
            <Col
              xs={12}
              md={10} mdOffset={1}
              lg={8} lgOffset={2}
              style={{ marginBottom: -30 }}
            >
              {Object.keys(categoryInfo).map(category => (
                <VoteCategory category={category} key={category} />
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
  ({ hugoVotes, user }, { params }) => {
    const id = params && Number(params.id);
    const people = user.get('people');
    return {
      person: id && people && people.find(p => p.get('id') === id),
      signature: hugoVotes.get('signature'),
      voterId: hugoVotes.get('id')
    }
  }, {
    getFinalists,
    setScene,
    setVoter
  }
)(Vote);
