import React from 'react';
import { connect } from 'react-redux'
const { Col, Row } = require('react-flexbox-grid');

import { setTitle } from '../../app/actions/app'
import { API_ROOT } from '../../constants'
import API from '../../lib/api'

import ArtistCard from './ArtistCard'
import ArtworkCard from './ArtworkCard';
import ArtworkAdderCard from './ArtworkAdderCard'
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
      //console.log('ARTIST', artist);
      if (artist && artist.people_id > 0) {
        this.setState(artist);
        raami.GET('works').then(works => {
          //console.log('WORKS', works);
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

  render() {
    return (<Row>
      <Col
        xs={12} sm={6}
        md={5} mdOffset={1}
        lg={4} lgOffset={2}
      >
        <ArtistCard
          artist={this.state}
          onChange={update => this.setState(update)}
          onSave={() => this.handleSubmit()}
          style={{ marginBottom: '1rem' }}
        />
      </Col>
      <Col xs={12} sm={6} md={5} lg={4}>
        <GalleryCard
          artist={this.state}
          onChange={update => this.setState(update)}
          onSave={() => this.handleSubmit()}
          style={{ marginBottom: '1rem' }}
        />
        <ArtworkAdderCard
          onAdd={() => this.addWork()}
          style={{ marginBottom: '1rem' }}
        />
        {this.state.Works.map((work, i) => (
          <ArtworkCard
            key={i}
            onDelete={() => this.deleteWork(i, work.id)}
            onSave={newWork => this.saveWork(i, work.id, newWork)}
            style={{ marginBottom: '1rem' }}
            work={work}
          />
        ))}
      </Col>
    </Row>)
  }
}

export default connect(
  null, {
    setTitle,
  }
)(Registration);
