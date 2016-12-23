import React from 'react';

// import { Form, actions, Control, Field, Errors } from 'react-redux-form';
// import LocalForm from 'react-redux-form';

import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton'
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
const { Col, Row } = require('react-flexbox-grid');
// import { Receiver } from 'react-file-uploader';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import FileInput from 'react-file-input'

const raami = 'https://localhost:4430/api/raami/'
const people = 'https://localhost:4430/api/people/'

  function getapi(url) {
    // RETURN the promise
    return fetch(url).then((response)=>{
        return response.json(); // process it inside the `then`
    });
  }
  
  function postapi(url, json) {
    // RETURN the promise
    return fetch(url, {
      headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(json)
    }).then((response)=>{
        return response.json(); // process it inside the `then`
    });
  }

  function putapi(url, json) {
    // RETURN the promise
    return fetch(url, {
      headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(json)
    }).then((response)=>{
        return response.json(); // process it inside the `then`
    });
  }

   function delapi(url) {
    // RETURN the promise
    return fetch(url).then((response)=>{
        return response.json(); // process it inside the `then`
    });
  } 

export default class ExhibitReg extends React.Component {

  constructor(props) {
    super(props);
    
    const member = props.params.id
    var ID = 0

    this.state = {
      id: null,
      person_id: member,
      name: '',
      url:'',
      description:'',
      transport:'',
      continent: '',
      filename:'',
      filedata: null,
      legal: false,
      auction:'',
      print:'',
      digital: false,
      open: false,
      Works: [{ id: null, 
            artist_id: ID, 
            title: '',
            width: '',
            height: '', 
            technique: '', 
            orientation: '', 
            filename: '', 
            filedata: null,
            year: '', 
            price: '', 
            gallery: ''}]

      }

    getapi(raami+'people/'+member).then((data)=>{
      if(data.length > 0 && data[0].id > 0) {
        ID = data[0].id
        this.setState(data[0])
        console.log(data[0])
        var _work = this.state.Works.slice();
        _work[0].artist_id = ID
        getapi(raami+'works/'+ID).then(res => {
          if(res.works.length > 0) {
            res.works.forEach((item) => {
              _work.unshift(item)
              
            })
          this.setState({Works:_work})
          }
      })

        }
        
      })

  }

  handleSubmit(artist) {
    // const { dispatch } = this.props;

    var data = this.state

    console.log(data)

    if(this.state.id > 0) {
      putapi(raami+'artist/'+this.state.id, data).then(res=>{
        console.log(res)
      })      
    } else {

      postapi(raami+'artist', data).then(res=>{
        console.log(res)
      })

    }
  }

  submitWork(i) {

    var data = this.state.Works[i]
    var _id =  this.state.Works[i].id

    if(_id > 0) {
      putapi(raami+'work/'+_id, data).then(res=>{
        console.log(res)
      })      
    } else {
      delete data.id
      console.log(JSON.stringify(data))
      postapi(raami+'work', data).then(res=>{
        console.log(res)
      })

    }
  }

  addWork() {
    // const { dispatch } = this.props;
    
    var _work = this.state.Works.slice();

      _work.push(
          { id: null, 
            artist_id: ID, 
            title: '',
            width: '',
            height: '', 
            technique: '', 
            orientation: '', 
            filename: '', 
            filedata: null, 
            price: '',
            year: '', 
            gallery: ''}

      )

    this.setState({Works: _work})
    }

  handleWork(i, field, e) {
    var _work = this.state.Works.slice();
    _work[i][field] = e.target.value; 
    this.setState({Works:_work});    
    
  }

  selectWork(i, field, e, key, val) {
      var _work = this.state.Works.slice();
      _work[i][field] = val; 
      this.setState({Works:_work});
    }


  handleChange(field, e) {
    var newState = {}; 
    newState[field] = e.target.value; 
    this.setState(newState);    
    
  }

  handleImage(i, e) {
     // e.preventDefault();

    var reader = new FileReader();
    var file = e.target.files[0];
    reader.onloadend = () => {

          var _work = this.state.Works.slice();
          _work[i]['filename'] = file.name;
          _work[i]['filedata'] = reader.result;
          this.setState({Works:_work});   
      }
    reader.readAsDataURL(file)
    console.log(this.state.Works[i])
    }

  handlePreview(e) {
     // e.preventDefault();

    var reader = new FileReader();
    var file = e.target.files[0];
    reader.onloadend = () => {

      this.setState({
        filename: file.name,
        filedata: reader.result
      });
    }
    reader.readAsDataURL(file)

  }


  handleCheck(name, e, val) {
    console.log(e.target)
    this.setState({name:val});   
  }

  handleSelect(name, e, key, val) {
    console.log(name ,key,val)
    this.setState({name:val});  
  }

  handleOpen = () => {
    this.setState({open: true});
    event.preventDefault()
  };

  handleClose = () => {
    this.setState({open: false});
  };


  render() {


  /**** inline styles ****/

  const grey = { 
      color: '#bbb',
      fontSize: '17px',
      zIndex: '0'
     }

  const paper = {
      display: 'inline-block',
      float: 'left',
      padding: '20px'
  }

  const zindex = {
      zIndex: '0',
      position: 'absolute'
  }

  var works = []
  
  this.state.Works.forEach((work, i)=> {

    works.push(
      <Col xs={12} sm={6} key={ i }>
    <form>        
          <Paper style={paper}>
      <Row>
        <Col >
          <TextField  floatingLabelText="Work title"  value={this.state.Works[i].title} onChange={this.handleWork.bind(this, i, 'title')} required={true} />
        </Col>
      </Row>
      <Row>
    <Col className="upload">    
    <span style={grey}>Upload image (max 2 MB)</span>
    <br/>
    <span style={zindex} className="upload">
        <FileInput name="work" 
                       accept=".jpg"
                       placeholder="[ Work preview ]" 
                       onChange={this.handleImage.bind(this, i)} />
                       <br/><br/>
        </span><br/>
      {this.state.Works[i].filedata &&
        <img src={this.state.Works[i].filedata} required={true} width="250px" />
      }
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={6}>
          <TextField type="number" floatingLabelText="Width (cm)"  value={this.state.Works[i].width} onChange={this.handleWork.bind(this,  i, 'width')} required={true} />
        </Col>
          <Col xs={12} sm={6}>
          <TextField type="number" floatingLabelText="Height (cm)"  required={true} value={this.state.Works[i].height} onChange={this.handleWork.bind(this,  i,  'height')}/>
        </Col>
      </Row>
        <Row>
        <Col>
      <SelectField
          floatingLabelText="Display"
          onChange={this.selectWork.bind(this, i, 'orientation')}  value={this.state.Works[i].orientation}>
              <MenuItem value={'Table'} primaryText="Table-top display" />
              <MenuItem value={'Wall'} primaryText="Wall mounted" />
          </SelectField>
          </Col>
        </Row>
        <Row>
        <Col>
      <SelectField
          floatingLabelText="Technique" value={this.state.Works[i].technique}
          onChange={this.selectWork.bind(this, i, 'technique')} >
              <MenuItem value={'Painting'} primaryText="Painting" />
              <MenuItem value={'Drawing'} primaryText="Drawing" />
              <MenuItem value={'Mixed'} primaryText="Mixed media" />
              <MenuItem value={'Photograph'} primaryText="Photograph" />
              <MenuItem value={'Digital'} primaryText="Digital" />
              <MenuItem value={'3D'} primaryText="3D (ie. sculpture)" />
          </SelectField>
          </Col>
        </Row>
        <Row>
        <Col>
      <SelectField
          floatingLabelText="Select Gallery"  value={this.state.Works[i].gallery}
          onChange={this.selectWork.bind(this, i, 'gallery')}>
              <MenuItem value={'Auction'} primaryText="Auction gallery" />
              <MenuItem value={'Printshop'} primaryText="Printshop" />
              <MenuItem value={'Digital'} primaryText="Digital galler" />
          </SelectField>
          </Col>
        </Row>
      <Row>
        <Col xs={12} sm={6}>
          <TextField  type="number" floatingLabelText="Year"  onChange={this.handleWork.bind(this,  i, 'year')} required={true} value={this.state.Works[i].year}/>
        </Col>
          <Col xs={12} sm={6}>
          <TextField  type="number" floatingLabelText="Estimated value (euro)"  onChange={this.handleWork.bind(this,  i, 'price')} required={true} value={this.state.Works[i].price} />
        </Col>
      </Row>
      <Row>
       <Col>
          <FlatButton type="submit" label="Save" onClick={this.submitWork.bind(this, i)} className="button-submit" primary={true} />
        </Col>
        </Row>
        </Paper><br /> 
        </form> 
        </Col>
    )
  })

  // console.log(this.state.Works.length+1)

    return (
  <Card>
  <CardHeader>
  <h2>Worldcon 75 Art Exhibition Registration Form</h2>
  </CardHeader>
  <CardText>
  <Row>
    <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Artist name" value={this.state.name} onChange={this.handleChange.bind(this, 'name')} required={true} />
    </Col>
  </Row>
    <Row>
    <Col xs={12} sm={6}>
      <TextField  floatingLabelText="Website URL" onChange={this.handleChange.bind(this, 'url')} value={this.state.url} />
    </Col>
  </Row>
  <Row>
    <Col xs={12} sm={4}>
      <TextField floatingLabelText="Artist's description" id="description" value={this.state.description} onChange={this.handleChange.bind(this, 'description')} multiLine={true} rows={5}/>
    </Col>
    </Row>
    <Row>
    <Col className="upload">    
    <span style={grey}>Upload image (Max 2MB)</span>
    <br/>
    <span style={zindex} className="upload">
        <FileInput name="Image"
                       accept=".jpg"
                       placeholder="[ Preview image ]" 
                       onChange={this.handlePreview.bind(this)} />
        </span><br/>
        {this.state.filedata &&
            <img src={this.state.filedata} width="250px" />
          }
    </Col>
  </Row>
  <Row>
  <Col>
  <SelectField
      floatingLabelText="Continent for tax purposes" 
      onChange={this.handleSelect.bind(this, 'continent')} value={this.state.continent}>
          <MenuItem value={'EU'} primaryText="EU" />
          <MenuItem value={'NON-EU'} primaryText="NON-EU" />
      </SelectField>
      </Col>
    </Row>
  <Row>
  <Col>
  <SelectField
      floatingLabelText="Select Transportation method" 
      onChange={this.handleSelect.bind(this, 'transport')} value={this.state.transport}>
            <MenuItem value={'Air mail'} primaryText="Air mail" />
            <MenuItem value={'Courier'} primaryText="Couerier" />
            <MenuItem value={'Self'} primaryText="Deliver self" />
      </SelectField>
      <br />
      </Col>
    </Row>
    <Row>
    <Col>
      <h3>Reserve gallery space</h3>
    </Col>
    </Row>
    <Row>
      <Col>
        <TextField type="number" floatingLabelText="Auction gallery (m)" min="0" onChange={this.handleChange.bind(this, 'auction')} value={this.state.auction}/>
      </Col>
    <Col>
    <TextField type="number" floatingLabelText="Printshop gallery (m)" min="0" onChange={this.handleChange.bind(this, 'print')} value={this.state.print} />
    </Col>
    </Row>
    <Row>
    <Col>
    <label style={grey} >Digital gallery (Max 20 works)
    <Checkbox onChange={this.handleCheck.bind(this,'digital')} value={this.state.digital} /></label>
    </Col>
    </Row>
      <Row>
        <Col xs={12} sm={3}><br /><br />
      <RaisedButton type="submit" label="Save"
      disabled={ this.state.legal } 
      className="button-submit" onClick={this.handleSubmit.bind(this)} primary={true} />
      </Col>
          <Col ><br /><br />
      <a href="javascript:void(0);" onClick={ this.handleOpen } style={grey}>Accept legal note</a>
      <Checkbox onChange={this.handleCheck.bind(this,'legal')} value={this.state.legal} />
      <Dialog
          title="Legal note"
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque quis tellus pulvinar, auctor justo id, eleifend augue. Nunc ultrices feugiat magna, non consectetur arcu sagittis et. Morbi sit amet facilisis neque. Mauris aliquam sollicitudin elit, eu facilisis magna sagittis at. Etiam feugiat eu urna ut lobortis. Vivamus eros libero, posuere vel fringilla nec, interdum at magna. Vestibulum placerat, velit at venenatis maximus, turpis leo rutrum nibh, in imperdiet metus diam vel nunc. Maecenas lorem risus, euismod a luctus sed, suscipit viverra massa. Vivamus nisi quam, ullamcorper et nisl ac, pulvinar consequat lorem. Praesent bibendum, est id fringilla sagittis, neque ipsum mattis turpis, a vulputate ipsum sapien ut sapien. Integer sollicitudin vulputate nisi. Nam molestie porttitor lectus vel porta.
        <br/>
        Suspendisse vehicula egestas massa ut porttitor. Integer molestie elementum placerat. Phasellus vestibulum feugiat odio et mattis. Ut lacinia augue id enim suscipit, quis suscipit nibh molestie. Suspendisse congue eros mattis molestie varius. Nam commodo ante sapien, a porttitor orci blandit nec. Quisque aliquet lacus sed nunc condimentum fringilla. Proin elementum, eros vitae vulputate mattis, sapien dolor tincidunt sem, in venenatis felis nisl vel felis. Morbi eu posuere libero, sit amet viverra augue. Fusce eleifend vehicula lectus, at feugiat ex faucibus non. Vestibulum hendrerit ex at sem placerat, in suscipit augue efficitur. Cras porta dui ut mauris pellentesque, fermentum vestibulum mauris dictum. Phasellus dignissim tortor vitae mattis ornare. Curabitur dignissim volutpat scelerisque. Pellentesque tempus tempor nisl lobortis consequat. Aenean rutrum augue a euismod mollis.

        </Dialog>
    </Col>
      </Row>
      <Row>
      <Col xs={12}>
      < br/>
      <Divider />
            <h3>Submitted art works </h3>
          </Col>
      </Row>
      <Row>
        { works }

        <Col>
        <br />
        <RaisedButton type="button" label="Add" onClick={this.addWork.bind(this)} className="button-submit" />
        </Col>
        </Row>
      </CardText>
  </Card>
      )
  };
}

