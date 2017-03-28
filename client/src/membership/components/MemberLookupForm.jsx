import { Map } from 'immutable'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
const { Col, Row } = require('react-flexbox-grid');
const ImmutablePropTypes = require('react-immutable-proptypes');
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField';

import { memberLookup } from '../actions'
import { LookupPropTypes } from '../reducers/lookup'
import { TextInput } from './form-components'

class MemberLookupForm extends React.Component {

  static propTypes = {
    lookupData: LookupPropTypes.lookup.isRequired,
    memberLookup: PropTypes.func.isRequired,
    style: PropTypes.object,
    onQueryResults: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      fetching: false,
      focusRef: null,
      member_number: '',
      name: '',
      query: null,
      results: null
    }
  }

  componentWillReceiveProps(nextProps) {
    const query = this.state.query;
    const results = nextProps.lookupData.get(query);
    if (results && !results.equals(this.state.results)) {
      this.setState({ fetching: false, results });
      nextProps.onQueryResults({ query, results });
    }
  }

  get disableSubmit() {
    const { email, name } = this.state;
    return !(name || email && /.@./.test(email));
  }

  get gotMultipleResults() {
    const { results } = this.state
    return results && results.get('status') === 'multiple';
  }

  get gotNoResults() {
    const { results } = this.state
    return results && results.get('status') === 'not found';
  }

  get query() {
    const { email, member_number, name } = this.state;
    const query = {};
    if (email && /.@./.test(email)) query.email = email.trim();
    if (member_number > 0) query.member_number = Number(member_number);
    if (name) query.name = name.trim();
    return Map(query);
  }

  submit = () => {
    const { fetching } = this.state;
    const query = this.query;
    if (!fetching && query.size > 0 && !this.disableSubmit) {
      const { lookupData, memberLookup, onQueryResults } = this.props;
      const results = lookupData.get(query) || null;
      this.setState({ fetching: !results, query, results });
      if (results) {
        onQueryResults({ query, results });
      } else {
        memberLookup(query);
      }
    }
  }

  render() {
    const { style } = this.props;
    const { email, member_number, name, results } = this.state;
    return (
      <Row style={style}>
        <Col xs={12} md={6}>
          <TextField
            autoFocus={true}
            hintText="Name"
            fullWidth={true}
            onBlur={this.submit}
            onChange={(ev, name) => this.setState({ name })}
            value={name}
          />
        </Col>
        <Col xs={12} md={6}>
          <TextField
            hintText="Email address"
            fullWidth={true}
            onBlur={this.submit}
            onChange={(ev, email) => this.setState({ email })}
            value={email}
          />
        </Col>

        <Col xs={6}>
          {member_number || this.gotMultipleResults ? <TextField
            hintText="Member number"
            fullWidth={true}
            onBlur={this.submit}
            onChange={(ev, member_number) => this.setState({ member_number })}
            type="number"
            value={member_number}
          /> : null}
        </Col>

        <Col xs={6} style={{
          alignItems: 'flex-end',
          display: 'flex',
          height: 40,
          justifyContent: 'flex-end',
          marginBottom: 8
        }}>
          <RaisedButton
            disabled={this.disableSubmit}
            label="Find"
            onTouchTap={this.submit}
            style={{ flexShrink: 1 }}
          />
        </Col>

        <Col xs={12} style={{
          color: 'rgba(0, 0, 0, 0.3)',
          fontSize: 'smaller',
          textAlign: 'right'
        }}>
          {
            this.gotMultipleResults ? 'Multiple matches found. Please add more details.'
            : this.gotNoResults ? 'No matches found.'
            : null
          }
        </Col>

      </Row>
    );
  }
}

export default connect(
  ({ lookup }) => ({
    lookupData: lookup
  }), {
    memberLookup
  }
)(MemberLookupForm);
