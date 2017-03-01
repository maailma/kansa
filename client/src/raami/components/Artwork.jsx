import React from 'react';

import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
const { Col, Row } = require('react-flexbox-grid');
import Paper from 'material-ui/Paper';
import FileInput from 'react-file-input';

export default class Artwork extends React.Component {

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
      gallery: React.PropTypes.string
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

    const paper = {
      display: 'inline-block',
      float: 'left',
      padding: 20,
      marginTop: 20,
      marginLeft: 20
    };

    const zindex = {
      zIndex: '0',
      position: 'absolute'
    };
    return (
      <Paper style={paper}>
        <Row>
          <Col>
            <TextField
              floatingLabelStyle={label}
              floatingLabelText="Artwork title"
              onChange={(ev, title) => this.setState({ title })}
              style={{ width: '500px' }}
              value={this.state.title || ''}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <SelectField
              floatingLabelStyle={label}
              floatingLabelText="Select Gallery"
              onChange={(ev, idx, gallery) => this.setState({ gallery })}
              value={this.state.gallery || ''}
            >
              <MenuItem value={'Auction'} primaryText="Auction gallery" />
              <MenuItem value={'Printshop'} primaryText="Printshop" />
              <MenuItem value={'Digital'} primaryText="Digital gallery" />
            </SelectField>
          </Col>
        </Row>
        <Row>
          <Col style={{ minHeight:'250px',display:'block',marginBottom:'20px'}} >
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
            <span style={{position:'relative', top: '20px'}}>
                <i>By uploading I give permission for this image to be <br/>
                reproduced to promote the art show on the Worldcon 75 website, <br/>
                social media accounts, and at the convention.</i>
              </span>
          </Col>
        </Row>
        <Row>
          <Col >
            <TextField
              type="number"
              name="width"
              floatingLabelText="Width"
              style={{width: '100px' }}
              floatingLabelStyle={label}
              value={this.state.width || 0}
              onChange={this.handleSize}
            />
          </Col>
          <Col >
            <TextField
              type="number"
              name="height"
              floatingLabelText="Height"
              style={{width: '100px' }}
              floatingLabelStyle={label}
              value={this.state.height || 0}
              onChange={this.handleSize}
            />
          </Col>
          <Col >
            <TextField
              type="number"
              name="depth"
              floatingLabelStyle={label}
              floatingLabelText="Depth"
              style={{width: '100px' }}
              onChange={this.handleSize}
              value={this.state.depth || 0}
            /> cm
          </Col>
        </Row>
        <Row>
          <Col>
            <SelectField
              floatingLabelStyle={label}
              floatingLabelText="Technique"
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
          </Col>
        </Row>
        <Row>
          <Col>
            <SelectField
              floatingLabelText="Display"
              floatingLabelStyle={label}
              onChange={(ev, idx, orientation) => this.setState({ orientation })}
              value={this.state.orientation || ''}
            >
              <MenuItem value={'Table'} primaryText="Table-top display" />
              <MenuItem value={'Wall'} primaryText="Wall mounted" />
            </SelectField>
          </Col>
        </Row>
        <Row>
          <Col>
            <FlatButton
              type="submit"
              label="Save"
              onClick={() => this.props.onSave(this.state)}
              className="button-submit"
              primary={true}
            />
            <FlatButton
              type="submit"
              label="Delete"
              onClick={() => this.props.onDelete()}
              className="button-submit"
              secondary={true}
            />
          </Col>
        </Row>
      </Paper>
    );
  }
}
