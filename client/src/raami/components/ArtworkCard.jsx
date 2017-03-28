import React from 'react';

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
const { Col, Row } = require('react-flexbox-grid');
import FileInput from 'react-file-input';

export default class ArtworkCard extends React.Component {

  static propTypes = {
    onDelete: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    work: React.PropTypes.shape({
      title: React.PropTypes.string,
      width: React.PropTypes.number,
      height: React.PropTypes.number,
      depth: React.PropTypes.number,
      technique: React.PropTypes.string,
      orientation: React.PropTypes.string,
      filename: React.PropTypes.string,
      filedata: React.PropTypes.object,
      year: React.PropTypes.number,
      price: React.PropTypes.number,
      gallery: React.PropTypes.string,
      start: React.PropTypes.number,
      sale: React.PropTypes.number,
      right: React.PropTypes.boolean,
      copies: React.PropTypes.number,
      form: React.PropTypes.string,
      original: React.PropTypes.boolean
    })
  };

  constructor(props) {
    super(props);
    this.state = Object.assign({}, props.work);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.work);
  }

  handleImage = (ev) => {
    const file = ev.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => this.setState({
      filename: file.name,
      filedata: reader.result
    });
    reader.readAsDataURL(file)
  };

  handleSize = (ev, strVal) => {
    let val = Number(strVal);
    if (isNaN(val) || val < 0) val = 0;
    this.setState({ [ev.target.name]: val });
  };

  render() {
    const center = {
      textAlign: 'center'
    };
    const grey = {
      color: '#888',
      fontSize: '16px',
      zIndex: '0'
    };
    const label = {
      color: '#888',
      fontSize: '16px',
    };

    const zindex = {
      zIndex: '0',
      position: 'absolute'
    };

    const labelStyle = {
      color: '#888',
      fontSize: 16
    };

    let prev_height = '0px';
    
    if( this.state.filedata) {

      prev_height = '250px';
    }

    return <Card style={this.props.style}>
      <CardText>
        <TextField
          floatingLabelStyle={label}
          floatingLabelText="Artwork title"
          fullWidth={true}
          onChange={(ev, title) => this.setState({ title })}
          value={this.state.title || ''}
        />
        <div style={{ minHeight: prev_height, display:'block',marginBottom:'20px'}} >
          <span style={grey}>Preview image (max 2 MB)</span>
          <br/>
          <span className="upload" style={zindex}>
            <FileInput
              accept=".jpg"
              onChange={this.handleImage}
              placeholder="[ Upload ]"
            />
            <br/><br/>
          </span>
          <br/>
          {this.state.filedata && <img src={this.state.filedata} width="250px" />}
          <br/>
          <span style={{position:'relative', top: '20px', fontSize: 11 }}>
              <i>By uploading I give permission for this image to be 
              reproduced to promote the art show on the Worldcon 75 website, social media accounts,
              and at the convention.</i>
            </span>
        </div>

        <Row style={{ alignItems: 'center' }}>
          <Col xs={3}>
            <TextField
              type="number"
              name="width"
              floatingLabelText="Width"
              fullWidth={true}
              floatingLabelStyle={label}
              value={this.state.width || 0}
              onChange={this.handleSize}
            />
          </Col>
          <Col xs={3}>
            <TextField
              type="number"
              name="height"
              floatingLabelText="Height"
              fullWidth={true}
              floatingLabelStyle={label}
              value={this.state.height || 0}
              onChange={this.handleSize}
            />
          </Col>
          <Col xs={3}>
            <TextField
              type="number"
              name="depth"
              floatingLabelStyle={label}
              floatingLabelText="Depth"
              fullWidth={true}
              onChange={this.handleSize}
              value={this.state.depth || 0}
            />
          </Col>
          <Col xs={3}>
            cm
          </Col>
        </Row>

        <SelectField
          floatingLabelStyle={label}
          floatingLabelText="Technique"
          fullWidth={true}
          onChange={(ev, idx, technique) => this.setState({ technique })}
          value={this.state.technique || ''}
        >
          <MenuItem value={'Painting'} primaryText="Painting" />
          <MenuItem value={'Drawing'} primaryText="Drawing" />
          <MenuItem value={'Mixed'} primaryText="Mixed media" />
          <MenuItem value={'Photograph'} primaryText="Photograph" />
          <MenuItem value={'Digital'} primaryText="Digital" />
          <MenuItem value={'3D'} primaryText="3D (ie. sculpture)" />
          <MenuItem value={'Other'} primaryText="Other (eg. jewellery)" />
        </SelectField>
        <SelectField
          floatingLabelText="Display"
          floatingLabelStyle={label}
          fullWidth={true}
          onChange={(ev, idx, orientation) => this.setState({ orientation })}
          value={this.state.orientation || ''}
        >
          <MenuItem value={'Table'} primaryText="Table-top display" />
          <MenuItem value={'Wall'} primaryText="Wall mounted" />
        </SelectField>
          <SelectField
          floatingLabelStyle={label}
          floatingLabelText="Select Gallery"
          fullWidth={true}
          onChange={(ev, idx, gallery) => this.setState({ gallery })}
          value={this.state.gallery || ''}
        >
          <MenuItem value={'Auction'} primaryText="Auction gallery" />
          <MenuItem value={'Printshop'} primaryText="Printshop" />
          <MenuItem value={'Digital'} primaryText="Digital gallery" />
        </SelectField>

        { this.state.gallery == 'Auction' && 
        <Row>
        <Col xs={8}>
          <Checkbox
            checked={this.state.original || true }
            label="Original item"
            labelStyle={labelStyle}
            onCheck={(ev, value) => this.setState({ original: value })}
            style={{ marginTop: 20 }}
          />
      </Col>
          <Col xs={6}>
            <TextField
              type="number"
              name="start"
              min = {0}
              floatingLabelStyle={label}
              floatingLabelText="Starting auction €"
              fullWidth={true}
              onChange={ev => this.setState({ start: Math.max(0, ev.target.value) })}
              value={this.state.start || 0}
            />           
          </Col>
          <Col xs={6}>
            <TextField
              type="number"
              name="sale"
              min = {0}
              floatingLabelStyle={label}
              floatingLabelText="Instant sale €"
              fullWidth={true}
              onChange={ev => this.setState({ sale: Math.max(0, ev.target.value) })}
              value={this.state.sale || 0}
            /> 
          </Col>

        </Row>
        }
        { this.state.gallery == 'Printshop' &&
        <Row>
          <Col xs={4}>
            <TextField
              type="number"
              name="copies"
              min = {0}
              floatingLabelStyle={label}
              floatingLabelText="No. of copies"
              fullWidth={true}
              onChange={ev => this.setState({ copies: Math.max(0, ev.target.value) })}
              value={this.state.copies || 1}
            />
          </Col>
          <Col xs={4}>
            <TextField
              type="number"
              name="Price"
              min = {0}
              floatingLabelStyle={label}
              floatingLabelText="Price €"
              fullWidth={true}
              onChange={ev => this.setState({ price: Math.max(0, ev.target.value) })}
              value={this.state.price || 0}
            />
          </Col>
          <Col xs={8}>
            <SelectField
            floatingLabelStyle={label}
            floatingLabelText="Item format"
            fullWidth={true}
            onChange={(ev, idx, form) => this.setState({ form })}
            value={this.state.form || ''}
          >
            <MenuItem value={'unframed'} primaryText="Unframed print" />
            <MenuItem value={'framed'} primaryText="Framed print" />
            <MenuItem value={'t-shirt'} primaryText="T-shirt" />
            <MenuItem value={'mug'} primaryText="Mug" />
            <MenuItem value={'other'} primaryText="Other (Please email us!)" />
          </SelectField>
          </Col>
        </Row>
      }
      </CardText>

      <CardActions>
        <FlatButton
          type="submit"
          label="Save"
          onClick={() => this.props.onSave(this.state)}
          primary={true}
        />
        <FlatButton
          type="submit"
          label="Delete"
          onClick={() => this.props.onDelete()}
          secondary={true}
        />
      </CardActions>
    </Card>;
  }
}
