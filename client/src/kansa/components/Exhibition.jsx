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

// const ddstyle= {
//         display: 'block', 
//         padding: '25px',
//         border: '1px solid #ddd',
//         background: '#ccc',
//         verticalAlign: 'middle',
//         textAlign: 'center',
//         position: 'relative',

//       }

const grey = { 
      color: '#bbb',
      fontSize: '17px'
     }

const paper = {
    display: 'inline-block',
    float: 'left',
    padding: '20px'
}

export default class ExhibitReg extends React.Component {
    handleSubmit(artist) {
    const { dispatch } = this.props;

    Work.push(Work.length+1)

    // Do whatever you like in here.
    // You can use actions such as:
    // dispatch(actions.submit('user', somePromise));
    // etc.
  }

  render() {
  
    return (
  <Card>
  <CardHeader>
  <h2>Worlcon 75 Art Exhibition Registration Form</h2>
  </CardHeader>
  <CardText>
  <Row>
    <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Artist name" required={true} />
    </Col>
  </Row>
  <Row>
  <SelectField
      floatingLabelText="Continent"
      onChange={this.handleChange}>
            <MenuItem value={'EU'} primaryText="EU" />
          <MenuItem value={'NON-EU'} primaryText="NON-EU" />
      </SelectField>
    </Row>
    <Row>
    <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Website URL"/>
    </Col>
  </Row>
  <Row>
    <Col xs={12} sm={4}>
      <TextField floatingLabelText="Artist's description" multiLine={true} rows={5}/>
    </Col>
    </Row>
    <Row>
    <p style={grey}>Upload your portfolio<br/>
    <input type="file" />   
  </p>
  </Row>
  <Row>
  <SelectField
      floatingLabelText="Select Transportation method"
      onChange={this.handleChange}>
            <MenuItem value={'Air mail'} primaryText="Air mail" />
            <MenuItem value={'Courier'} primaryText="Couerier" />
            <MenuItem value={'Self'} primaryText="Deliver self" />
      </SelectField>
    </Row>
    <Row>
    <Col xs={12} sm={4}>
      <p style={grey} >Accept legal note</p>
      <Checkbox />
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
        { Works.forEach(works => <WorkForm />) }
        </Row>
      </CardText>
  </Card>

      )
  };
}

export class WorkForm extends React.Component {
    handleSubmit(work) {
    Work.push(Work.length+1)
    
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
