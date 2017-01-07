import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const ImmutablePropTypes = require('react-immutable-proptypes');

import { UpgradeFields } from './form-components';
import Member from './Member';

function getIn(obj, path, unset) {
  const val = obj[path[0]];
  if (typeof val === 'undefined') return unset;
  return path.length <= 1 ? val : val.getIn(path.slice(1), unset);
}

export default class Upgrade extends React.Component {
  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    style: React.PropTypes.object
  }

  state = {
    membership: null,
    paper_pubs: null,
    open: false,
    sent: false
  }

  handleOpen = () => { this.setState({
    membership: this.props.member.get('membership'),
    paper_pubs: null,
    open: true,
    sent: false
  }) }

  handleClose = () => { this.setState({ open: false }) }

  setStateIn = (path, value) => {
    const key = path[0];
    if (path.length > 1) value = this.state[key].setIn(path.slice(1), value);
    return this.setState({ [key]: value });
  }

  render() {
    const { member, style } = this.props;
    const prevMembership = member.get('membership');
    if (prevMembership === 'Adult' && member.get('paper_pubs')) return null;

    const { membership, paper_pubs, sent, open } = this.state;
    const button = React.Children.only(this.props.children);
    const msChanged = membership !== prevMembership;
    const disabled = sent || (!msChanged && !paper_pubs) || !Member.paperPubsIsValid(paper_pubs);
    return <div style={style}>
      { React.cloneElement(button, { onTouchTap: this.handleOpen }) }
      <Dialog
        title={ 'Upgrade ' + member.get('legal_name') }
        open={open}
        autoScrollBodyContent={true}
        onRequestClose={this.handleClose}
        actions={[
          <FlatButton key='cancel' label='Cancel' onTouchTap={this.handleClose} />,
          <FlatButton
            key='ok'
            label={ sent ? 'Working...' : 'Pay by card' }
            disabled={disabled}
            onTouchTap={ () => {
              this.setState({ sent: true });
              const upgrade = {};
              if (msChanged) upgrade.membership = membership;
              if (paper_pubs) upgrade.paper_pubs = paper_pubs.toJS();
              console.log('TODO: apply upgrade', upgrade, member.toJS());
              this.handleClose();
            }}
          />
        ]}
      >
        <UpgradeFields
          getDefaultValue={ path => member.getIn(path, null) }
          getValue={ path => getIn(this.state, path, '') }
          onChange={ this.setStateIn }
        />
      </Dialog>
    </div>;
  }
}
