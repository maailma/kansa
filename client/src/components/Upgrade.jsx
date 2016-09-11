import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

const ImmutablePropTypes = require('react-immutable-proptypes');

import { UpgradeFields, CommentField } from './form';
import Member from './Member';

function getIn(obj, path, unset) {
  const val = obj[path[0]];
  if (typeof val === 'undefined') return unset;
  return path.length <= 1 ? val : val.getIn(path.slice(1), unset);
}

export default class Upgrade extends React.Component {
  static propTypes = {
    membership: React.PropTypes.string.isRequired,
    paper_pubs: ImmutablePropTypes.mapContains({
      name: React.PropTypes.string.isRequired,
      address: React.PropTypes.string.isRequired,
      country: React.PropTypes.string.isRequired
    }),
    name: React.PropTypes.string.isRequired,
    upgrade: React.PropTypes.func.isRequired
  }

  state = {
    membership: null,
    paper_pubs: null,
    comment: '',
    open: false,
    sent: false
  }

  handleOpen = () => { this.setState({
    membership: this.props.membership,
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
    const { comment, membership, paper_pubs, sent, open } = this.state;
    const button = React.Children.only(this.props.children);
    const msChanged = membership !== this.props.membership;
    const disabled = sent || !comment || (!msChanged && !paper_pubs)
        || !Member.paperPubsIsValid(paper_pubs);
    const formProps = {
      getDefaultValue: path => getIn(this.props, path, null),
      getValue: path => getIn(this.state, path, ''),
      onChange: this.setStateIn
    }
    return <div>
      { React.cloneElement(button, { onTouchTap: this.handleOpen }) }
      <Dialog
        bodyStyle={{ paddingLeft: 0 }}
        title={ 'Upgrade ' + this.props.name }
        open={open}
        autoScrollBodyContent={true}
        onRequestClose={this.handleClose}
        actions={[
          <FlatButton key='cancel' label='Cancel' onTouchTap={this.handleClose} />,
          <FlatButton key='ok'
            label={ sent ? 'Working...' : 'Apply' }
            disabled={disabled}
            onTouchTap={ () => {
              this.setState({ sent: true });
              const res = { comment };
              if (msChanged) res.membership = membership;
              if (paper_pubs) res.paper_pubs = paper_pubs.toJS();
              (this.props.upgrade(res) || Promise.reject('Upgrade expected a Promise from upgrade()'))
                .then(res => {
                  console.log('Member upgraded', res);
                  this.handleClose();
                })
                .catch(e => console.error(e));  // TODO: report errors better
            }}
          />
        ]}
      >
        <UpgradeFields { ...formProps } />
        <br />
        <CommentField { ...formProps } />
      </Dialog>
    </div>;
  }
}
