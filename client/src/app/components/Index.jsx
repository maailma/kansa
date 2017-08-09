import { List } from 'immutable'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { setScene } from '../actions/app'
import { getPrices, getPurchaseData, getPurchaseList } from '../../payments/actions'
import PaymentCard from '../../payments/components/payment-card'
import * as PaymentPropTypes from '../../payments/proptypes'
import MemberCard from '../../membership/components/MemberCard'
import NewMemberCard from '../../membership/components/NewMemberCard'
import KeyRequest from './KeyRequest'

class Index extends Component {
  static propTypes = {
    getPrices: PropTypes.func.isRequired,
    getPurchaseData: PropTypes.func.isRequired,
    getPurchaseList: PropTypes.func.isRequired,
    people: ImmutablePropTypes.list.isRequired,
    purchase: PaymentPropTypes.root,
    push: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired
  }

  componentDidMount () {
    const { getPrices, getPurchaseData, purchase, setScene } = this.props
    setScene({ title: 'Memberships', dockSidebar: false })
    if (!purchase.get('prices')) getPrices()
    if (!purchase.get('data')) getPurchaseData()
  }

  componentWillReceiveProps ({ getPurchaseList, people, purchase }) {
    if (people.size > 0 && !purchase.get('list')) getPurchaseList()
  }

  get invoiceCards () {
    const { people, purchase } = this.props
    if (!purchase.get('list') || !purchase.get('data')) return []
    const getCategoryData = (category, type) => (
      purchase.getIn(['data', category]) || purchase.get('data').find(cd => cd.get('types').some(td => td.get('key') === type))
    )
    return purchase.get('list')
      .filter(p => p.get('status') === 'invoice')
      .map((purchase, key) => {
        const category = purchase.get('category')
        const type = purchase.get('type')
        const categoryData = getCategoryData(category, type)
        return (
          <PaymentCard
            key={key}
            label={categoryData.getIn(['types', type, 'label']) || type}
            purchase={purchase}
            shape={categoryData.get('shape')}
            userIds={people.map(p => p.get('id'))}
          />
        )
      })
  }

  get memberCards () {
    const { people } = this.props
    const hugoCount = people.reduce((sum, m) => (
      sum + (m.get('can_hugo_nominate') || m.get('can_hugo_vote') ? 1 : 0)
    ), 0)
    return people.map((member, key) => (
      <MemberCard
        key={key}
        member={member}
        showHugoActions={hugoCount === 1}
      />
    ))
  }

  render () {
    const { people, purchase, push } = this.props
    const isLoggedIn = !!(people && people.size)
    const upgradePath = people && people.size === 1
      ? `/upgrade/${people.first().get('id')}` : '/upgrade/'
    return <Row style={{ marginBottom: -24 }}>
      <Col xs={12} sm={6} lg={4} lgOffset={2}>
        {isLoggedIn ? [this.invoiceCards, this.memberCards] : <KeyRequest />}
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <Card
          style={{ marginBottom: 24 }}
        >
          <CardHeader
            className='action-head'
            textStyle={{ paddingRight: 0 }}
            title='Attending membership sales have ended'
            style={{ fontWeight: 600, marginBottom: 16 }}
          />
          <CardText
            style={{ paddingTop: 0 }}
          >
            <p>Worldcon 75 has closed all advance day pass and all attending membership sales. <a href="http://www.worldcon.fi/news/closure-membership-sales/">Full announcement</a></p>
          </CardText>
        </Card>
        <NewMemberCard
          category='support'
          onSelectType={(type) => push(`/new/${type}`)}
          prices={purchase.get('prices')}
        />
      </Col>
    </Row>
  }
}

export default connect(
  ({ purchase, user }) => ({
    people: user.get('people') || List(),
    purchase
  }), {
    getPrices,
    getPurchaseData,
    getPurchaseList,
    push,
    setScene
  }
)(Index)
