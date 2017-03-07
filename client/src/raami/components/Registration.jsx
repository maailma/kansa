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
import Paper from 'material-ui/Paper'
import OpenInNew from 'material-ui/svg-icons/action/open-in-new'

import { setTitle } from '../../app/actions/app'
import { API_ROOT } from '../../constants'
import API from '../../lib/api'

import Artwork from './Artwork';
import ArtworkAdderCard from './ArtworkAdderCard'
import { BasicRulesDialog } from './basic-rules'
import GalleryCard from './GalleryCard'

class Registration extends React.Component {

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
    this.props.setTitle('Art Show Registration')
  }

  componentWillUnmount() {
    this.props.setTitle('');
  }

  handleSubmit() {
    const artist = Object.assign({}, this.state, {
      api: undefined,
      Works: undefined
    });
    this.state.api.POST('artist', artist).then(res => console.log('POST ARTIST', artist, res));
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

    return (<Row>
      <Col xs={12} sm={6} lg={4}>
        <Card>
          <CardHeader style={{ fontWeight: 600 }} title="Artist information"/>
          <CardText>
            <p>
              Please fill in the general fields to register to the W75 art show.
              You can come back to edit this form and fill in details concerning
              individual art works later. The fee is a preliminary estimate and
              may change. Payment will be due in April by the latest. Please wait
              for confirmation and an invoice from the art show before attempting
              to pay. Changes and additions to this form will be notified by email.
            </p>

            <TextField
              floatingLabelStyle={label}
              floatingLabelText="Artist name"
              fullWidth={true}
              onChange={ev => this.setState({ name: ev.target.value })}
              value={this.state.name}
            />
            <TextField
              floatingLabelStyle={label}
              floatingLabelText="Website URL"
              fullWidth={true}
              onChange={ev => this.setState({ url: ev.target.value })}
              value={this.state.url}
            />
            <TextField
              floatingLabelStyle={label}
              floatingLabelText="Short description for catalogue/website (500 characters)"
              fullWidth={true}
              multiLine={true}
              onChange={ev => this.setState({ description: ev.target.value })}
              rows={5}
              value={this.state.description}
            />
            <SelectField
              floatingLabelStyle={label}
              floatingLabelText="Continent for tax purposes"
              fullWidth={true}
              onChange={(ev, key, value) => this.setState({ continent: value })}
              value={this.state.continent}
            >
              <MenuItem value="EU" primaryText="EU" />
              <MenuItem value="NON-EU" primaryText="NON-EU" />
            </SelectField>
            <SelectField
              floatingLabelStyle={label}
              floatingLabelText="Select Transportation method"
              fullWidth={true}
              onChange={(ev, key, value) => this.setState({ transport: value })}
              value={this.state.transport}
            >
              <MenuItem value="Air mail" primaryText="Air mail" />
              <MenuItem value="Courier" primaryText="Courier" />
              <MenuItem value="Self" primaryText="Deliver self" />
            </SelectField>
            <TextField
              floatingLabelStyle={label}
              floatingLabelText="Agent name and contact details (if applicable)"
              fullWidth={true}
              multiLine={true}
              onChange={ev => this.setState({ agent: ev.target.value })}
              rows={3}
              value={this.state.agent}
            />

            <Row style={{ alignItems: 'center', padding: '12px 0' }}>
              <Col xs={12}>
                <Checkbox
                  checked={this.state.legal}
                  labelStyle={grey}
                  onCheck={(ev, value) => this.setState({ legal: value })}
                  style={{ width: 'auto', float: 'left' }}
                />
                <span style={label}>
                  I accept the{' '}
                  <BasicRulesDialog>
                    <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                      Worldcon 75 Art Show Basic Rules
                      <OpenInNew style={{ color: '#888', height: 16, marginLeft: 2, position: 'relative', top: 3 }} />
                    </span>
                  </BasicRulesDialog>
                </span>
              </Col>
            </Row>

            <RaisedButton
              type="submit"
              label="Save"
              disabled={ !this.state.legal }
              className="button-submit"
              onClick={this.handleSubmit.bind(this)}
              primary={true}
            />

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
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <GalleryCard
          artist={this.state}
          onChange={update => this.setState(update)}
          onSave={() => this.handleSubmit()}
          style={{ marginBottom: '1rem' }}
        />
        <ArtworkAdderCard
          onAdd={() => this.addWork()}
        />
      </Col>
    </Row>)
  }
}

export default connect(
  null, {
    setTitle,
  }
)(Registration);
