import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { setScene } from '../../app/actions/app'
import { getPrices } from '../../payments/actions'
import NewMemberCard from './NewMemberCard'

class NewMemberIndex extends React.Component {
  static propTypes = {
    getPrices: React.PropTypes.func.isRequired,
    prices: ImmutablePropTypes.map,
    push: React.PropTypes.func.isRequired,
    setScene: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const { getPrices, prices } = this.props;
    if (!prices) getPrices();
  }

  componentDidMount() {
    this.props.setScene({ title: 'New Membership', dockSidebar: false });
  }

  onSelectType = (type) => this.props.push(`/new/${type}`);

  render() {
    const { prices, push } = this.props;
    return <Row style={{ marginBottom: -24 }}>
      <Col
        xs={12}
        sm={6}
        md={5} mdOffset={1}
        lg={4} lgOffset={2}
        style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
      >
        <NewMemberCard category="attend" onSelectType={this.onSelectType} prices={prices}/>
        <NewMemberCard category="upgrade" onSelectType={() => push('/upgrade')} />
        <NewMemberCard category="child" onSelectType={this.onSelectType} prices={prices}/>
      </Col>
      <Col
        xs={12}
        sm={6}
        md={5}
        lg={4}
        style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
      >
        <NewMemberCard category="support" onSelectType={this.onSelectType} prices={prices}/>
        <NewMemberCard category="daypass" onSelectType={(type) => push(`/daypass/${type}`)} />
      </Col>
    </Row>;
  }
}

export default connect(
  ({ purchase }) => ({
    prices: purchase.get('prices')
  }), {
    getPrices,
    push,
    setScene,
  }
)(NewMemberIndex);
