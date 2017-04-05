import { Map } from 'immutable'
import React from 'react'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');

import { emptyPaperPubsMap } from '../constants'
import { TextInput } from './form-components'
import { paperPubsIsValid, AddPaperPubs, EditPaperPubs } from './paper-pubs'

export const hintStyle = {
  color: 'rgba(0, 0, 0, 0.3)',
  fontSize: 13,
  marginBottom: 24
};

export default class MemberForm extends React.Component {

  static propTypes = {
    member: ImmutablePropTypes.mapContains({
      paper_pubs: ImmutablePropTypes.map
    }),
    newMember: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    prices: ImmutablePropTypes.map,
    tabIndex: React.PropTypes.number
  }

  static isValid(member) {
    return Map.isMap(member)
      && member.get('legal_name', false) && member.get('email', false)
      && paperPubsIsValid(member.get('paper_pubs'));
  }

  constructor(props) {
    super(props);
    this.state = {
      member: props.member || Map()
    };
  }

  componentWillReceiveProps(nextProps) {
    const { member, onChange } = nextProps;
    if (!member) {
      this.setState({ member: Map() });
    } else if (!member.equals(this.props.member)) {
      this.setState({ member }, () => {
        onChange(this.isValid, this.changes);
      });
    }
  }

  get changes() {
    const { member, newMember } = this.props;
    return this.state.member.filter(
      newMember || !member
        ? (value) => value
        : (value, key) => {
            let v0 = member.get(key);
            if (typeof value === 'string' && !v0) v0 = '';
            return Map.isMap(value) ? !value.equals(v0) : value !== v0;
          }
    );
  }

  getDefaultValue = (path) => this.props.member && this.props.member.getIn(path) || '';
  getValue = (path) => this.state.member.getIn(path) || '';

  get hasPaperPubs() {
    return !!this.state.member.get('paper_pubs');
  }

  get isValid() {
    return MemberForm.isValid(this.state.member);
  }

  onChange = (path, value) => {
    this.setState({
      member: this.state.member.setIn(path, value)
    }, () => {
      this.props.onChange(this.isValid, this.changes);
    });
  };

  render() {
    const { newMember, prices, tabIndex } = this.props;
    const inputProps = {
      getDefaultValue: this.getDefaultValue,
      getValue: this.getValue,
      onChange: this.onChange,
      tabIndex: tabIndex
    };
    return <form>
      <Row>
        <Col xs={12} sm={6}>
          <TextInput
            { ...inputProps }
            inputRef={ focusRef => this.focusRef = focusRef }
            path='legal_name'
            required={true}
          />
          <div style={hintStyle}>
            We'll need to check this against an official ID at the con, but
            otherwise it'll stay confidential.
          </div>
        </Col>
        <Col xs={12} sm={6}>
          { newMember ? [
              <TextInput { ...inputProps } key="input" path='email' required={true} />,
              <div key="hint" style={hintStyle}>
                How we'll get in touch with you before the con, and where we'll
                send important information about the Hugo Awards and Worldcon Site
                Selection.
              </div>
          ] : [
              <TextInput { ...inputProps } key="input" path='email' disabled={true} />,
              <div key="hint" style={hintStyle}>
                To change the email address associated with this membership, please
                get in touch with us at <a href="mailto:registration@worldcon.fi">
                registration@worldcon.fi</a>
              </div>
          ] }
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={6}>
          <TextInput { ...inputProps } path='public_first_name' />
        </Col>
        <Col xs={12} sm={6}>
          <TextInput { ...inputProps } path='public_last_name' />
        </Col>
        <Col xs={12} style={hintStyle}>
          How shall we list you in public? Leave these fields blank if you'd
          prefer we don't list you at all on our website or elsewhere. If you
          give us two names, we'll use the second for alphabetization (either
          can contain spaces). A few months before the con, you'll be able to
          separately customize the text of your badge.
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={4}>
          <TextInput { ...inputProps } path='city' />
        </Col>
        <Col xs={12} sm={4}>
          <TextInput { ...inputProps } label="State/province" path='state' />
        </Col>
        <Col xs={12} sm={4}>
          <TextInput { ...inputProps } path='country' />
        </Col>
        <Col xs={12} style={hintStyle}>
          Where you're from. Not strictly speaking necessary, but we'd love to
          know how much world is coming to our Worldcon. Be as specific as you
          wish; not all fields will apply to everyone.
        </Col>
      </Row>
      {newMember ? (
        <AddPaperPubs
          prices={prices}
          {...inputProps}
        />
      ) : this.hasPaperPubs ? (
        <EditPaperPubs
          prices={prices}
          {...inputProps}
        />
      ) : null}
    </form>;
  }

  componentDidMount() {
    this.focusRef && this.focusRef.focus();
  }
}
