import { Map } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { replace } from 'react-router-redux'

const { Col, Row } = require('react-flexbox-grid');
import { Card, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider'
import Snackbar from 'material-ui/Snackbar'

import { setScene } from '../app/actions/app'
import { categoryInfo } from '../hugo-nominations/constants'

import { getFinalists, setVoter } from './actions'
import * as VotePropTypes from './proptypes'
import VoteCategory from './components/category'
import VoteIntro from './components/intro'

class Vote extends React.Component {

  static propTypes = {
    getFinalists: PropTypes.func.isRequired,
    params: PropTypes.shape({ id: PropTypes.string }),
    person: ImmutablePropTypes.map,
    replace: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    setVoter: PropTypes.func.isRequired,
    signature: PropTypes.string,
    soleVoterId: PropTypes.number,
    voterId: PropTypes.number
  }

  componentDidMount() {
    const { getFinalists, setScene } = this.props;
    getFinalists();
    setScene({ title: 'Hugo Award Voting', dockSidebar: false });
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps({ params, person, replace, setVoter, soleVoterId, voterId }) {
    const personId = person && person.get('id') || null;
    if (personId !== voterId) setVoter(personId, null);
    if (!person) {
      if (params.id) replace('/hugo/vote');
      else if (soleVoterId) replace(`/hugo/vote/${soleVoterId}`);
    }
  }

  render() {
    const { person, setVoter, signature } = this.props;
    const active = person && person.get('can_hugo_vote');
    return (
      <div>
        <Row>
          <Col
            xs={12}
            sm={10} smOffset={1}
            md={8} mdOffset={2}
            lg={6} lgOffset={3}
            style={{ paddingTop: 20 }}
          >
            <VoteIntro
              person={person}
              signature={signature}
              setSignature={signature => setVoter(person.get('id'), signature)}
            />
          </Col>
        </Row>
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
              <div
                className="bg-text"
                style={{
                  fontSize: 14,
                  marginTop: -14,
                  padding: '0 0 16px 15px',
                  position: 'absolute',
                  width: '48%'
                }}
              >
                <p>
                  Your votes are automatically saved to our server every few
                  seconds. You will receive a confirmation email of your votes
                  thirty minutes after your last change.
                </p>
                <p>
                  Thank you for voting in the 2017 Hugo Awards!
                </p>
                <p>
                  <Link to="/">&laquo; Return to the main member page</Link>
                </p>
              </div>
            </Col>
          </Row>
        ) : null}
      </div>
    );
  }
}

export default connect(
  ({ hugoVotes, user }, { params }) => {
    const id = params && Number(params.id) || null;
    const people = user.get('people');
    const pv = id ? null : people && people.filter(p => p.get('can_hugo_vote'))
    return {
      person: id && people && people.find(p => p.get('id') === id) || null,
      signature: hugoVotes.get('signature'),
      soleVoterId: pv && pv.size === 1 && pv.first().get('id') || null,
      voterId: hugoVotes.get('id')
    }
  }, {
    getFinalists,
    replace,
    setScene,
    setVoter
  }
)(Vote);
