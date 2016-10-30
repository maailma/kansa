import React from 'react'

import DownloadIcon from 'material-ui/svg-icons/file/cloud-download'
import FinalistsIcon from 'material-ui/svg-icons/image/filter-6'
import IconButton from 'material-ui/IconButton'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import { categoryInfo } from '../../hugo/constants'


export default class NominationFilter extends React.Component {

  static propTypes = {
    category: React.PropTypes.string.isRequired,
    getBallots: React.PropTypes.func.isRequired,
    query: React.PropTypes.string,
    setQuery: React.PropTypes.func.isRequired,
    showFinalists: React.PropTypes.func.isRequired,
    showNominations: React.PropTypes.func.isRequired
  }

  state = {
    anchorEl: null,
    open: false
  }

  handleTouchTap = (event) => {
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  render() {
    const { category, getBallots, query, setQuery, showFinalists, showNominations } = this.props;
    const { anchorEl, open } = this.state;

    return <div
      style={{
        alignItems: 'center',
        background: 'white',
        display: 'flex',
        height: 56,
        left: 0,
        padding: '0 12px',
        position: 'fixed',
        top: 0,
        zIndex: 1
      }}
    >
      <RaisedButton
        onTouchTap={this.handleTouchTap}
        label={category}
        style={{ marginRight: 12 }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={ () => this.setState({ open: false }) }
      >
        <Menu>{
          Object.keys(categoryInfo).map(cat => <MenuItem
            key={cat}
            onTouchTap={ () => {
              this.setState({ open: false });
              showNominations(cat);
              setQuery('');
            } }
            primaryText={cat}
          />)
        }</Menu>
      </Popover>
      <IconButton
        onTouchTap={ () => {
          showFinalists(category);
          setQuery('');
        } }
        tooltip={`Show ${category} finalists`}
      >
        <FinalistsIcon />
      </IconButton>
      <IconButton
        onTouchTap={getBallots}
        tooltip={`Refresh ${category} ballots`}
      >
        <DownloadIcon />
      </IconButton>
      <TextField
        hintText='Search'
        onChange={ ev => setQuery(ev.target.value) }
        style={{ paddingLeft: 12 }}
        value={query}
      />
    </div>
  }

}
