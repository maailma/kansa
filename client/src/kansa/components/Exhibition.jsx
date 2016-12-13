import React from 'react';

// import { Form, actions, Control, Field, Errors } from 'react-redux-form';
// import LocalForm from 'react-redux-form';

import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
const { Col, Row } = require('react-flexbox-grid');
// import { Receiver } from 'react-file-uploader';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';

const Works = [1]

const raami = 'https://localhost:4430/api/raami/'
const people = 'https://localhost:4430/api/people/'
var data = new Array();

const grey = { 
      color: '#bbb',
      fontSize: '17px'
     }

const paper = {
    display: 'inline-block',
    float: 'left',
    padding: '20px'
}

  function api(url) {
    // RETURN the promise
    return fetch(url).then((response)=>{
        return response.json(); // process it inside the `then`
    });
  }

export default class ExhibitReg extends React.Component {

  constructor(props) {
    super(props);
    const member = props.params.id

    this.state = {
      name: '',
      url:'',
      description:'',
      transport:'',
      continent: '',
      legal: false,
      }

    api(raami+'people/'+member).then((data)=>{

      this.state.name = data[0].name;
      this.state.url = data[0].url;
      this.state.description = data[0].description;
      this.state.transport = data[0].transport;
      this.state.continent = data[0].continent;
      this.state.legal = data[0].legal;

    // access the value inside the `then`
    })

    console.log(this.state)
    // new Promise(function(reject, resolve) {
    //   fetch(raami+'people/'+member)
    //        .then(result=> result.json() )
    //        .resolve(data => {
    //           return data
    //           })
    //   });    
    
    // console.log(data)
     
    }



  handleSubmit(artist) {
    const { dispatch } = this.props;

    Work.push(Work.length+1)

    // Do whatever you like in here.
    // You can use actions such as:
    // dispatch(actions.submit('user', somePromise));
    // etc.

    }


  handleChange(e) {
    console.log(e.target)
  }

  render() {
  
    return (
  <Card>
  <CardHeader>
  <h2>Worldcon 75 Art Exhibition Registration Form</h2>
  </CardHeader>
  <CardText>
  <Row>
    <Col xs={12} sm={6}>
    {this.state.name}
      <TextField  floatingLabelText="Artist name" value={this.state.name} required={true} />
    </Col>
  </Row>
    <Row>
    <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Website URL" value={this.state.url}/>
    </Col>
  </Row>
  <Row>
    <Col xs={12} sm={4}>
      <TextField floatingLabelText="Artist's description" value={this.state.description} multiLine={true} rows={5}/>
    </Col>
    </Row>
    <Row>
    <p style={grey}>Upload your portfolio<br/>
    <input type="file" />   
  </p>
  </Row>
  <Row>
  <SelectField
      floatingLabelText="Continent for tax purposes"
      onChange={this.handleChange} value={this.state.continent}>
          <MenuItem value={'EU'} primaryText="EU" />
          <MenuItem value={'NON-EU'} primaryText="NON-EU" />
      </SelectField>
    </Row>
  <Row>
  <SelectField
      floatingLabelText="Select Transportation method"
      onChange={this.handleChange} value={this.state.transport}>
            <MenuItem value={'Air mail'} primaryText="Air mail" />
            <MenuItem value={'Courier'} primaryText="Couerier" />
            <MenuItem value={'Self'} primaryText="Deliver self" />
      </SelectField>
    </Row>
    <Row>
    <Col xs={12} sm={4}>
      <p ><a href="#" style={grey}>Accept legal note</a></p>
      <Checkbox value={this.state.legal} />
    </Col>
      </Row>
      <Row>
      <FlatButton type="submit" label="Save" className="button-submit" primary={true} />
      </Row>
      <Row>
      <Col xs={12}>
            <h3>Submitted art works</h3>
          </Col>
      </Row>
      <Row>
        < WorkForm />
        { Works.forEach(works =>  <WorkForm /> ) }
        </Row>
      </CardText>
  </Card>

      )
  };
}

export class WorkForm extends React.Component {
    handleSubmit(work) {
    Work.push(Work.length+1)
      console.log(Work)
    
    const { dispatch } = this.props;
    

    // Do whatever you like in here.
    // You can use actions such as:
    // dispatch(actions.submit('user', somePromise));
    // etc.
  }
  render() {

    return (
    <Col xs={12} sm={6}>
      <Paper style={paper}>
  <Row>
    <Col >
      <TextField  floatingLabelText="Work title" required={true} />
    </Col>
  </Row>
  <Row>
    <p style={grey}>Upload image<br/>
  <input type="file" />    
  </p>
  </Row>
  <Row>
    <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Width (cm)" required={true} />
    </Col>
      <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Height (cm)" required={true} />
    </Col>
  </Row>
    <Row>
    <Col>
  <SelectField
      floatingLabelText="Display"
      onChange={this.handleChange}>
          <MenuItem value={'Table'} primaryText="Table-top display" />
          <MenuItem value={'Wall'} primaryText="Wall mounted" />
      </SelectField>
      </Col>
    </Row>
    <Row>
    <Col>
  <SelectField
      floatingLabelText="Technique"
      onChange={this.handleChange}>
          <MenuItem value={'Paiting'} primaryText="Paiting" />
          <MenuItem value={'Drawing'} primaryText="Drawing" />
          <MenuItem value={'Mixed'} primaryText="Mixed media" />
          <MenuItem value={'Photograph'} primaryText="Photograph" />
          <MenuItem value={'Digital'} primaryText="Digital" />
          <MenuItem value={'3D'} primaryText="3D" />
      </SelectField>
      </Col>
    </Row>
  <Row>
    <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Year" required={true} />
    </Col>
      <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Price" required={true} />
    </Col>
  </Row>
  <Row>
   <Col>
      <FlatButton type="submit" label="Add" className="button-submit" primary={true} />
    </Col>
    </Row>
    </Paper>
    </Col>
      )
    }
};    
