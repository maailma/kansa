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
import { Receiver } from 'react-file-uploader';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'


const Works = [1]


// export default class ExhibitReg extends React.Component {
//   handleSubmit(artist) {
//     const { dispatch } = this.props;

//     // Do whatever you like in here.
//     // You can use actions such as:
//     // dispatch(actions.submit('user', somePromise));
//     // etc.
//   }

//   render() {
//     return (<div>
//       <Form model="artist"
//         onSubmit={(artist) => this.handleSubmit(artist)}>
//                 <div className="field">
//         <label>Artist´s name:<br/>
//         <Control.text model="artist.name" /></label>
//         </div>
//                 <div className="field">
//         <label>(EU/NO-EU):</label><br/>
//         <Control.select model="artist.continent"><br/>
//           <option value="EU">IN EU</option>
//           <option value="NON-EU">NOT IN EU</option>
//         </Control.select>          
//         </div>
//         <div className="field">
//         <label>Website:<br/>
//         <Control.text model="artist.url" /></label><br/>
//         </div>
//         <div className="field">
//         <label>Image:</label><br/>
//         <Control.file model="artist.filedata" /><br/>
//         </div>
//                 <div className="field">
//         <label>Artist´s Description:</label><br/>
//         <Control.text model="artist.description" /><br/>
//         </div>
//                 <div className="field">
//         <label>Method of transportation:</label><br/>
//         <Control.select model="artist.transport">
//             <option value="Airmail">Air mail</option>
//             <option value="Courier">Courier</option>
//             <option value="Self">Deliver self</option>
//         </Control.select><br/>
//         </div>
//                 <div className="field">
//         <label>Upload your portfolio<br/>
//         <Control.file model="artist.filedata" /></label><br/>
//         </div>
//         <div className="field">
//         <label>Accept legal:<br/>
//         <Control.checkbox model="artist.legal" /></label><br/>
//         </div>
//         <label>Submitted works:</label><br/>
//         <Control.button >Add</Control.button><br/>
//         <button type="submit">Save
//         </button>
//       </Form>
//       </div>
//     );
//   }
// }


// class WorkForm extends React.Component {

//   handleSubmit(work) {
//     const { dispatch } = this.props;

//       Works.push(Works.length +1)

//     // Do whatever you like in here.
//     // You can use actions such as:
//     // dispatch(actions.submit('user', somePromise));
//     // etc.
//   }

//   render() {
//     return (
//       <LocalForm model="work"
//         onSubmit={(work) => this.handleSubmit(work)}>
//         <label>Work´s title:</label>
//         <Control.text model="work.title" />
    
//         <label>Orientation (EU/NO-EU):</label>
//         <Control.select model="work.orientation">
//           <option value="Table-top display">Table-top display</option>
//           <option value="Wall mounted">Wall mounted</option>
//         </Control.select>
//         <label>Width (cm):</label>
//         <Control.text model="work.width" />
//         <label>Height (cm):</label>
//         <Control.text model="work.height" />
//         <label>Technique (EU/NO-EU):</label>
//         <Control.select model="work.technique">
//             <option value='Painting'>Painting</option>
//             <option value='Drawing'>Drawing</option>
//             <option value='Mixed media'>Mixed media</option>
//             <option value='Photograph'>Photograph</option>
//             <option value='Digital'>Digital</option>
//             <option value='3D'>3D</option>
//         </Control.select>
//         <label>Image:</label>
//         <Control.file model="work.filedata" />
//         <label>Year:</label>
//         <Control.text model="work.year" />
//         <label>Price:</label>
//         <Control.text model="work.price" />

//         <button type="submit">
//         </button>
//       </LocalForm>
//     );
//   }
// }




export default class ExhibitReg extends React.Component {
    handleSubmit(user) {
    const { dispatch } = this.props;

    // Do whatever you like in here.
    // You can use actions such as:
    // dispatch(actions.submit('user', somePromise));
    // etc.
  }

  render() {
    const ddstyle= {
        display: 'block', 
        width:300,
        height: 200,
        border: '1px solid #ddd',
        background: '#ccc',
        verticalAlign: 'middle',
        textAlign: 'center'}

    const grey = { color: #ddd }

    return (
  <Card>
  <CardHeader>
  <h3>Worlcon 75 Art Exhibition Registration Form</h3>
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
      <TextField floatingLabelText="Artist's description" />
    </Col>
    </Row>
    <Row>
    <h4 style={grey}>Upload your portfolio</h4>
    <div>
  <Receiver   
  onDragEnter={()=> {} }
  onDragOver={()=> {} }
  onDragLeave={()=> {} }
  onFileDrop={()=> {} }
  isOpen={true}>
      <div style={ddstyle}>
        <h4>(drag & drop panel)</h4>
      </div>
  </Receiver>    
  </div>
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
    <h4 style={grey} >Accept legal notification</h4>
      <Checkbox />
    </Col>
      </Row>
      <Row>
      <FlatButton type="submit" label="Save" className="button-submit" primary={true} />
      </Row>
      </CardText>
  </Card>)
  };
}
