import { Map } from 'immutable'
import React from 'react'
import { Link } from 'react-router'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'

const ImmutablePropTypes = require('react-immutable-proptypes');

import MemberForm from './MemberForm'
import MemberMenu from './MemberMenu'
import Upgrade from './Upgrade'

export default class Member extends React.Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    showHugoActions: React.PropTypes.bool
  }

  static defaultProps = {
    member: Map()
  }

  state = {
    canSubmit: false,
    form: null
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.canSubmit !== this.state.canSubmit) return true;
    if (nextState.form !== this.state.form) return true;
    if (!nextProps.member.equals(this.props.member)) return true;
    return false;
  }

  render() {
    const { member, showHugoActions } = this.props;
    if (!member) return null;
    const membership = member.get('membership', 'NonMember');
    const { canSubmit, form } = this.state;

    return <Card style={{ marginBottom: 24 }}>
      <CardHeader
        title={ membership }
        subtitle={ membership !== 'NonMember' ? '#' + member.get('member_number') : null }
      >
        <MemberMenu
          id={member.get('id')}
          style={{ float: 'right', marginRight: -12, marginTop: -4 }}
        />
      </CardHeader>
      <CardText>
        <MemberForm
          member={member}
          onChange={ (canSubmit) => this.setState({ canSubmit }) }
          setForm={ (form) => this.setState({ form }) }
        />
      </CardText>
      <CardActions
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          paddingRight: 8,
          paddingBottom: 16
        }}
      >
        <RaisedButton key='ok'
          disabled={ !canSubmit }
          label={ form && form.sent ? 'Working...' : 'Apply changes' }
          onTouchTap={ form && form.submit }
          style={{ flexShrink: 0 }}
        />
        <Upgrade
          member={member}
          style={{ marginRight: 8 }}
        >
          <RaisedButton label='Upgrade' />
        </Upgrade>
        { showHugoActions ? <Link
          style={{ flexGrow: 1, marginLeft: 8 }}
          to={`/hugo/${member.get('id')}/nominate`}
        >Nominate for the Hugo Awards</Link> : null }
      </CardActions>
    </Card>;
  }
}
