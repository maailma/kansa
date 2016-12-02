import { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'

const ImmutablePropTypes = require('react-immutable-proptypes');

import { memberUpdate } from '../actions'
import { CommonFields, PaperPubsFields } from './form-components'


class MemberForm extends React.Component {

  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }).isRequired,
    memberUpdate: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    setForm: React.PropTypes.func.isRequired
  }

  static paperPubsIsValid(pp) {
    return !pp || pp.get('name') && pp.get('address') && !!pp.get('country');
  }

  static isValid(member) {
    return Map.isMap(member)
      && member.get('legal_name', false) && member.get('email', false)
      && MemberForm.paperPubsIsValid(member.get('paper_pubs'));
  }

  constructor(props) {
    super(props);
    const { member, setForm } = props;
    this.state = {
      member,
      sent: false
    };
    setTimeout(() => setForm(this));
  }

  componentWillReceiveProps(nextProps) {
    const { member, onChange } = nextProps;
    if (!member.equals(this.props.member)) {
      this.setState({
        member,
        sent: false
      }, () => {
        onChange(this.canSubmit);
      });
    }
  }

  get _changes() {
    const m0 = this.props.member;
    return this.state.member.filter((value, key) => {
      let v0 = m0.get(key);
      if (typeof value === 'string' && !v0) v0 = '';
      return Map.isMap(value) ? !value.equals(v0) : value !== v0;
    });
  }

  // public
  get canSubmit() {
    return !this.sent &&
      this._changes.size > 0 &&
      MemberForm.isValid(this.state.member);
  }

  // public
  get sent() {
    return this.state.sent;
  }

  // public
  submit = () => {
    if (this.canSubmit) {
      const { member, memberUpdate } = this.props;
      this.setState({ sent: true });
      memberUpdate(member.get('id'), this._changes);
    }
  }

  getDefaultValue = (path) => this.props.member.getIn(path) || '';
  getValue = (path) => this.state.member.getIn(path) || '';

  onChange = (path, value) => {
    this.setState({
      member: this.state.member.setIn(path, value)
    }, () => {
      this.props.onChange(this.canSubmit);
    });
  };

  render() {
    return <div>
      <CommonFields
        getDefaultValue={this.getDefaultValue}
        getValue={this.getValue}
        onChange={this.onChange}
      />
      <br />
      <PaperPubsFields
        getDefaultValue={this.getDefaultValue}
        getValue={this.getValue}
        onChange={this.onChange}
      />
    </div>;
  }

}

export default connect(null, {
  memberUpdate
})(MemberForm);
