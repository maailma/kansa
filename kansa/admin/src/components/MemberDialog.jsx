import { Map } from 'immutable'
import React from 'react'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import MemberForm from './MemberForm';

const MemberDialog = ({ ok, cancel, formId = 'member-form', member = Map() }) => (<Dialog
  key='dialog'
  title='Member form'
  actions={[
    <FlatButton key='cancel' label='Cancel'
      onTouchTap={cancel} />,
    <FlatButton key='ok' label='Apply' primary={true}
      onTouchTap={() => ok({
        form: document.getElementById(formId),
        id: member.get('id')
      })} />
  ]}
  modal={false}
  open={true}
  autoScrollBodyContent={true}
  bodyClassName='memberDialog'
  onRequestClose={cancel}
>
  <MemberForm formId={formId} member={member} />
</Dialog>);

MemberDialog.propTypes = {
  ok: React.PropTypes.func.isRequired,
  cancel: React.PropTypes.func.isRequired,
  formId: React.PropTypes.string,
  member: React.PropTypes.instanceOf(Map)
};

export default MemberDialog;
