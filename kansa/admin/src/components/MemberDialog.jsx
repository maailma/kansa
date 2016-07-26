import { Map } from 'immutable'
import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import MemberForm from './MemberForm';

const MemberDialog = ({ api, ok, cancel, formId = 'member-form', member = Map() }) => (<Dialog
  key='dialog'
  actions={[
    <FlatButton key='cancel' label='Cancel'
      onTouchTap={cancel} />,
    <FlatButton key='ok' label='Apply' primary={true}
      onTouchTap={() => {
        const update = {};
        const inputs = document.getElementById(formId).querySelectorAll('input');
        for (let i = 0; i < inputs.length; ++i) {
          const { name, value } = inputs[i];
          const v0 = member.get(name, '');
          if (value != v0) update[name] = value;
        }
        ok(api.POST(`people/${member.get('id')}`, update));
      }} />
  ]}
  modal={false}
  open={true}
  autoScrollBodyContent={true}
  bodyClassName='memberDialog'
  onRequestClose={cancel}
>
  <MemberForm { ...{ api, formId, member } } />
</Dialog>);

MemberDialog.propTypes = {
  api: React.PropTypes.object.isRequired,
  ok: React.PropTypes.func.isRequired,
  cancel: React.PropTypes.func.isRequired,
  formId: React.PropTypes.string,
  member: React.PropTypes.instanceOf(Map)
};

export default MemberDialog;
