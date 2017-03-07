import React from 'react';
import { connect } from 'react-redux'
const { Col, Row } = require('react-flexbox-grid');

import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton'
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider';

import { setTitle } from '../../app/actions/app'
import { API_ROOT } from '../../constants'
import API from '../../lib/api'

import Artwork from './Artwork';
import BasicRules from './basic-rules';

class ExhibitReg extends React.Component {

  static propTypes = {
    setTitle: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const member = props.params.id;
    console.log(props.params);
    this.state = {
      api: new API(`${API_ROOT}raami/${member}/`),
      people_id: parseInt(member),
      name: '',
      url:'',
      description:'',
      transport:'',
      continent: '',
      filename:'',
      filedata: null,
      legal: false,
      auction: 0,
      print: 0,
      digital: false,
      agent:'',
      contact:'',
      waitlist: false,
      postage: 0,
      open: false,
      Works: [{ id: null }]
    };
    const raami = this.state.api;
    raami.GET('artist').then(artist => {
      console.log('ARTIST', artist);
      if (artist && artist.people_id > 0) {
        this.setState(artist);
        raami.GET('works').then(works => {
          console.log('WORKS', works);
          if (Array.isArray(works)) this.setState({ Works: works });
        });
      }
    });
  }

  componentDidMount() {
    this.props.setTitle('- Art Show Registration')
  }

  componentWillUnmount() {
    this.props.setTitle('');
  }

  handleSubmit() {
    const artist = Object.assign({}, this.state, {
      api: undefined,
      Works: undefined
    });
    this.state.api.POST('artist', artist).then(res => console.log('POST ARTIST', res));
  }

  saveWork(i, id, work) {
    const raami = this.state.api;
    if (id) {
      raami.POST(`works/${id}`, work).then(res => {
        console.log('POST WORK', res);
        const works = this.state.Works.slice();
        works[i] = Object.assign({}, work, { id });
        this.setState({ Works: works });
      });
    } else {
      raami.PUT(`works`, work).then(res => {
        console.log('PUT WORK', res);
        const works = this.state.Works.slice();
        works[i] = Object.assign({}, work, { id: res.inserted });
        this.setState({ Works: works });
      })
    }
  }

  deleteWork(i, id) {
    if (id) this.state.api.DELETE(`works/${id}`)
      .then(res => console.log('DELETE WORK', res))
      .catch(() => {
        this.state.api.GET('works').then(works => {
          if (Array.isArray(works)) this.setState({ Works: works });
        });
      });
    const works = this.state.Works.slice();
    delete works[i];
    this.setState({ Works: works });
  }
  
  addWork() {
    const works = this.state.Works.slice();
    works.push({ id: null });
    this.setState({ Works: works });
  }

  handleChange(field, { target: { value } }) {
    if (typeof value === 'number' && value < 0) value = 0;
    this.setState({ [field]: value });
  }

  handleCheck(field, e, value) {
    this.setState({ [field]: value });
  }

  handleSelect(field, e, key, value) {
    this.setState({ [field]: value });
  }

  handleOpen = (e) => {
    this.setState({open: true});
    e.preventDefault()
  };

  handleClose = (e) => {
    this.setState({open: false});
  };

  render() {
    /**** inline styles ****/

    const grey = {
      color: '#888',
      fontSize: '16px',
      zIndex: '0'
    };

    const label = {
      color: '#888',
      fontSize: '16px',
    };

    const center = {
      textAlign: 'center'
    };

    const works = this.state.Works.map((work, i) => (
      <Col key={ i }>
        <Artwork
          onDelete={() => this.deleteWork(i, work.id)}
          onSave={newWork => this.saveWork(i, work.id, newWork)}
          work={work}
        />
      </Col>
    ));

    let total = this.state.auction * 20 + this.state.print * 10;
    if (this.state.digital) total += 20;
    if (this.state.postage > 0) total += parseInt(this.state.postage) + 20;

    return (
      <Card>
        <CardHeader>
          <h2>Worldcon 75 Art Show Registration Form</h2>
          <div style = {center}>
            <i>Please fill in the general fields to register to the W75 art show.
            You can come back to edit this form and fill in details concerning individual art works later.<br/>
            The fee is a preliminary estimate and may change. Payment will be due in April by the latest.<br/>
            Please wait for confirmation and an invoice from the art show before attempting to pay. <br/>
            Changes and additions to this form will be notified by email.</i>
          </div>
        </CardHeader>
        <CardText>
          <Row>
            <Col>
              <TextField  floatingLabelText="Artist name" style={{width: '500px' }}
              floatingLabelStyle={label} value={this.state.name}
              onChange={this.handleChange.bind(this, 'name')} />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField
                style={{width: '500px' }}
                floatingLabelText="Website URL"
                floatingLabelStyle={label}
                onChange={this.handleChange.bind(this, 'url')}
                value={this.state.url}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField
                floatingLabelText="Short description for catalogue/website (500 characters)"
                style={{width: '500px' }}
                floatingLabelStyle={label}
                id="description"
                value={this.state.description}
                onChange={this.handleChange.bind(this, 'description')}
                multiLine={true}
                rows={5}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <SelectField
                floatingLabelText="Continent for tax purposes"
                floatingLabelStyle={label}
                onChange={this.handleSelect.bind(this, 'continent')}
                value={this.state.continent}
              >
                <MenuItem value={'EU'} primaryText="EU" />
                <MenuItem value={'NON-EU'} primaryText="NON-EU" />
              </SelectField>
            </Col>
          </Row>
          <Row>
            <Col>
              <SelectField
                floatingLabelText="Select Transportation method"
                floatingLabelStyle={label}
                onChange={this.handleSelect.bind(this, 'transport')}
                value={this.state.transport}
              >
                <MenuItem value={'Air mail'} primaryText="Air mail" />
                <MenuItem value={'Courier'} primaryText="Courier" />
                <MenuItem value={'Self'} primaryText="Deliver self" />
              </SelectField>
              <br />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField
                floatingLabelText="Agent name and contact details (if applicable)"
                style={{width: '500px' }}
                floatingLabelStyle={label}
                onChange={this.handleChange.bind(this, 'agent')}
                value={this.state.agent}
                multiLine={true}
                rows={3}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <h3>Reserve Gallery Space</h3>
            </Col>
          </Row>
          <Row>
            <Col sm={2}> 
              <label style={label}>Auction gallery </label>
              </Col>
              <Col sm={4}>
              <TextField
                type="number"
                floatingLabelStyle={label}
                style={{width: '100px' }}
                floatingLabelText=""
                min="0"
                onChange={this.handleChange.bind(this, 'auction')}
                value={this.state.auction}
              /> m
            </Col>
          </Row>
          <Row>
            <Col sm={2}>
              <label style={label}>Printshop gallery </label>
              </Col>
              <Col sm={4}>
              <TextField
                type="number"
                floatingLabelStyle={label}
                style={{width: '100px' }}
                floatingLabelText=""
                min="0"
                onChange={this.handleChange.bind(this, 'print')}
                value={this.state.print}
              /> m
            </Col>
          </Row>
          <Row>
            <Col sm={4}>
              <Checkbox
                label="Digital gallery (Max 20 works)"
                labelPosition="left"
                labelStyle={grey}
                onCheck={this.handleCheck.bind(this,'digital')}
                checked={this.state.digital}
              />
              <br/>
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <label style={label} >Estimated Return Postage (plus 20 &euro; for handling) </label>
            </Col>
            <Col xs={4}>
              <TextField
                type="number"
                style={{width: '100px' }}
                value={this.state.postage}
                onChange={this.handleChange.bind(this, 'postage')}
              /> &euro;
            </Col>
          </Row>
          <Row>
            <Col xs={2}>
              <br/>
              <label style={{color:'#000',fontSize:'16px'}} >Total Cost of This Submission </label>
            </Col>
            <Col xs={4}>
              <TextField
                type="number"
                style={{width: '100px' }}
                value={total}
              /> &euro;
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <br/><br/>
              <Checkbox
                label="If the art show is full then I would like to go on the waiting list."
                labelPosition="left"
                labelStyle={grey}
                onCheck={this.handleCheck.bind(this, 'waitlist')}
                checked={this.state.waitlist}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={3}><br /><br />
              <RaisedButton
                type="submit"
                label="Save"
                disabled={ !this.state.legal }
                className="button-submit"
                onClick={this.handleSubmit.bind(this)}
                primary={true}
              />
            </Col>
            <Col ><br /><br />
              <a href="javascript:void(0);" onClick={ this.handleOpen } style={grey}>
                By ticking this box you accept<br/>
                the W75 Accept Basic Rules
              </a>
              <Checkbox onCheck={this.handleCheck.bind(this,'legal')} checked={this.state.legal} />
              <Dialog
                title="Accept W75 Basic rules"
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}
                autoScrollBodyContent = {true}
              >
                <BasicRules />
              </Dialog>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              < br/>
              <Divider />
              <h3>Submitted Artworks </h3>
              <div style= { center } >
                <i>
                  Please fill fields to submit individual artworks to the art show.<br/>
                  You may edit submitted artworks and their details at later date.
                </i>
              </div>
              <br/>
            </Col>
          </Row>
          <Row>
            { works }
            <Col xs= {12} >
              <br />
              <RaisedButton type="button" label="Add" onClick={this.addWork.bind(this)} className="button-submit" />
            </Col>
          </Row>
        </CardText>
      </Card>
    )
  }
}

export default connect(
  null, {
    setTitle,
  }
)(ExhibitReg);
