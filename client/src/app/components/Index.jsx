import { List } from 'immutable'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { setScene } from '../actions/app'
import { getPurchaseData, getPurchaseList } from '../../payments/actions'
import PaymentCard from '../../payments/components/payment-card'
import * as PaymentPropTypes from '../../payments/proptypes'
import MemberCard from '../../membership/components/MemberCard'
import NewMemberCard from '../../membership/components/NewMemberCard'
import KeyRequest from './KeyRequest'

class Index extends Component {
  static propTypes = {
    getPurchaseData: PropTypes.func.isRequired,
    getPurchaseList: PropTypes.func.isRequired,
    people: ImmutablePropTypes.list.isRequired,
    purchase: PaymentPropTypes.root,
    push: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired
  }

  componentDidMount () {
    const { getPurchaseData, purchase, setScene } = this.props
    setScene({ title: 'Memberships', dockSidebar: false })
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
      .map((p, key) => {
        const type = p.get('type')
        const categoryData = getCategoryData(p.get('category'), type)
        return (
          <PaymentCard
            key={key}
            label={categoryData.getIn(['types', type, 'label']) || type}
            purchase={p}
            shape={categoryData.get('shape')}
            userIds={people.map(pp => pp.get('id'))}
          />
        )
      })
  }

  get memberCards () {
    const { people } = this.props
    const hugoCount = people.reduce((sum, m) => (
      sum + (m.get('hugo_nominator') || m.get('hugo_voter') ? 1 : 0)
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
        <NewMemberCard
          category='all'
          data={purchase.get('data')}
          expandable
          onSelectType={(type) => push(`/new/${type}`)}
        />
        <NewMemberCard
          category='upgrade'
          disabled={!isLoggedIn}
          expandable={isLoggedIn}
          onSelectType={() => push(upgradePath)}
        />
        <NewMemberCard
          category='daypass'
          expandable
          onSelectType={(type) => push(`/daypass/${type}`)}
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
    getPurchaseData,
    getPurchaseList,
    push,
    setScene
  }
)(Index)
