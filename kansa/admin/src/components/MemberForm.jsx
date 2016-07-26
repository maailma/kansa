import { Map } from 'immutable'
import React from 'react'
import TextField from 'material-ui/TextField';

import Membership from './Membership';

const title = id => id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ');

export default class MemberForm extends React.Component {
  static propTypes = {
    api: React.PropTypes.object.isRequired,
    formId: React.PropTypes.string.isRequired,
    member: React.PropTypes.instanceOf(Map).isRequired
      /*
      id: 5,
      member_number: null,
      badge_text: No stinkin' badgesh,
      membership: Adult,
      can_hugo_nominate: true,
      can_hugo_vote: false,
      can_site_select: false,
      last_modified: 2016-06-18T14:16:30.312Z,
      paper_pubs: null
      */
  }

  text(id, props={}) {
    return <TextField
      id={id} name={id}
      defaultValue={this.props.member.get(id, '')}
      floatingLabelText={title(id)}
      floatingLabelFixed={true}
      className='memberInput'
      { ...props }
    />;
  }

  render() {
    const { api, formId, member } = this.props;
    const narrow = { style: { width: '162px' } };
    return <form id={formId}>
      {this.text('legal_name')}
      <Membership className='memberInput' style={{ display: 'inline-block' }}
        membership={member.get('membership')}
        name={ member.get('legal_name') + ' <' + member.get('email') + '>' }
        ok={ ({ membership, comment }) => api.POST(`people/${member.get('id')}/upgrade`, { membership, comment }) }
      />
      <br />
      {this.text('public_first_name')}
      {this.text('public_last_name')}
      <br />
      {this.text('email')}
      <br />
      {this.text('country', narrow)}
      {this.text('state', narrow)}
      {this.text('city', narrow)}
      <br />
    </form>;
  }
}
