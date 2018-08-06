import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { replace } from 'react-router-redux'

import { setScene } from '../app/actions/app'
import { categoryInfo } from '../hugo-nominations/constants'
import { ConfigConsumer } from '../lib/config-context'
import * as MemberPropTypes from '../membership/proptypes'

import { getFinalists, setVoter } from './actions'
import VoteCategory from './components/category'
import VoteIntro from './components/intro'
import PostDeadlineContents from './components/post-deadline-contents'

class Vote extends React.Component {
  static propTypes = {
    getFinalists: PropTypes.func.isRequired,
    getMemberAttr: PropTypes.func.isRequired,
    params: PropTypes.shape({ id: PropTypes.string }),
    people: MemberPropTypes.people,
    replace: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired,
    setVoter: PropTypes.func.isRequired,
    signature: PropTypes.string,
    voterId: PropTypes.number,
    votingOpen: PropTypes.bool
  }

  static getDerivedStateFromProps({ people, params }, state) {
    if (!people) return { person: null }
    const id = params && Number(params.id)
    const person = (id && people.find(p => p.get('id') === id)) || null
    return person === state.person ? null : { person }
  }

  state = {
    person: null
  }

  componentDidMount() {
    const { getFinalists, setScene } = this.props
    getFinalists()
    setScene({ title: 'Hugo Award Voting', dockSidebar: false })
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    const {
      getMemberAttr,
      params,
      people,
      replace,
      setVoter,
      voterId
    } = this.props
    const { person } = this.state
    const personId = (person && person.get('id')) || null
    if (personId !== voterId) setVoter(personId, null)
    if (!person) {
      if (params.id) replace('/hugo/vote')
      else if (people) {
        const pv = people.filter(p => getMemberAttr(p).wsfs_member)
        if (pv.size === 1) replace(`/hugo/vote/${pv.first().get('id')}`)
      }
    }
  }

  render() {
    const { setVoter, signature, votingOpen } = this.props
    const { person } = this.state
    return (
      <div>
        <Row>
          <Col
            xs={12}
            sm={10}
            smOffset={1}
            md={8}
            mdOffset={2}
            lg={6}
            lgOffset={3}
            style={{ paddingTop: 20 }}
          >
            {votingOpen ? (
              <VoteIntro
                person={person}
                signature={signature}
                setSignature={signature =>
                  setVoter(person.get('id'), signature)
                }
              />
            ) : (
              <PostDeadlineContents />
            )}
          </Col>
        </Row>
        {votingOpen && signature ? (
          <Row>
            <Col
              xs={12}
              md={10}
              mdOffset={1}
              lg={8}
              lgOffset={2}
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
                <p>Thank you for voting in the 2017 Hugo Awards!</p>
                <p>
                  <Link to="/">&laquo; Return to the main member page</Link>
                </p>
              </div>
            </Col>
          </Row>
        ) : null}
      </div>
    )
  }
}

export default connect(
  ({ hugoVotes, user }) => ({
    people: user.get('people'),
    signature: hugoVotes.get('signature'),
    voterId: hugoVotes.get('id'),
    votingOpen: true // TODO: parameterise properly
  }),
  {
    getFinalists,
    replace,
    setScene,
    setVoter
  }
)(props => (
  <ConfigConsumer>
    {({ getMemberAttr }) => <Vote getMemberAttr={getMemberAttr} {...props} />}
  </ConfigConsumer>
))
