import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Col, Row } from 'react-flexbox-grid'

import { setScene } from '../../app/actions/app'
import { getPurchaseData } from '../../payments/actions'
import * as PaymentPropTypes from '../../payments/proptypes'
import NewMemberCard from './NewMemberCard'

class NewMemberIndex extends Component {
  static propTypes = {
    data: PaymentPropTypes.data,
    getPurchaseData: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    setScene: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { data, getPurchaseData, setScene } = this.props
    if (!data) getPurchaseData()
    setScene({ title: 'New Membership', dockSidebar: false })
  }

  onSelectType = type => this.props.push(`/new/${type}`)

  render() {
    const { data, push } = this.props
    return (
      <Row style={{ marginBottom: -24 }}>
        <Col
          xs={12}
          sm={6}
          md={5}
          mdOffset={1}
          lg={4}
          lgOffset={2}
          style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
        >
          <NewMemberCard
            category="attend"
            onSelectType={this.onSelectType}
            data={data}
          />
          <NewMemberCard
            category="upgrade"
            onSelectType={() => push('/upgrade')}
          />
          <NewMemberCard
            category="child"
            onSelectType={this.onSelectType}
            data={data}
          />
        </Col>
        <Col
          xs={12}
          sm={6}
          md={5}
          lg={4}
          style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
        >
          <NewMemberCard
            category="support"
            onSelectType={this.onSelectType}
            data={data}
          />
          <NewMemberCard
            category="daypass"
            onSelectType={type => push(`/daypass/${type}`)}
          />
        </Col>
      </Row>
    )
  }
}

export default connect(
  ({ purchase }) => ({
    data: purchase.get('data')
  }),
  {
    getPurchaseData,
    push,
    setScene
  }
)(NewMemberIndex)
