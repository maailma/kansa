import React from 'react'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
const { Col, Row } = require('react-flexbox-grid');

export default class VoteSignature extends React.Component {

  static propTypes = {
    setSignature: React.PropTypes.func.isRequired
  }

  state = { name: '' }

  render() {
    const { setSignature, signature } = this.props;
    const { name } = this.state;
    return signature ? (
      <h3 style={{}}>Signing as "{signature}"</h3>
    ) : (
      <Row>
        <Col
          xs={10} xsOffset={1}
          sm={6} smOffset={3}
          lg={4} lgOffset={4}
        >
          <Card className='NominationCategory'>
            <CardText>
              <p>To start voting, please confirm your name:</p>
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
          </Card>
        </Col>
      </Row>
    );
  }

}
