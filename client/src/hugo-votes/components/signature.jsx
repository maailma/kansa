import { CardActions, CardHeader, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-flexbox-grid'
import ImmutablePropTypes from 'react-immutable-proptypes'

export default class VoteSignature extends React.Component {

  static propTypes = {
    person: ImmutablePropTypes.map.isRequired,
    preferredName: PropTypes.string,
    setSignature: PropTypes.func.isRequired,
  }

  state = { name: '' }

  render() {
    const { person, preferredName, setSignature } = this.props;
    const { name } = this.state;
    return (
      <div style={{ padding: '16px' }}>
        <CardText>
          To access the Hugo voter packet and/or to start voting, please enter
          your name here to confirm that you are
          {' '}<b>{preferredName}</b> ({person.get('email')}), Worldcon 75
          member <b>#{person.get('member_number')}</b>:
          <form onSubmit={ev => {
            ev.preventDefault();
            setSignature(name);
          }}>
            <TextField
              floatingLabelText="Signature"
              fullWidth={true}
              onChange={(ev, name) => this.setState({ name })}
              tabIndex={1}
              value={name}
            />
          </form>
        </CardText>
        <CardActions style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 8px 16px' }}>
          <FlatButton
            disabled={!name}
            label="OK"
            onTouchTap={() => setSignature(name)}
          />
        </CardActions>
      </div>
    );
  }

}
