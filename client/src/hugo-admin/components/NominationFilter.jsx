import React from 'react'

import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import { categoryInfo } from '../../hugo/constants'


export default class NominationFilter extends React.Component {

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
    const { category, query, setCategory, setQuery } = this.props;
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
      <div style={{ minWidth: 180 }}>
        <RaisedButton
          onTouchTap={this.handleTouchTap}
          label={category}
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
                setCategory(cat);
                this.setState({ open: false });
              } }
              primaryText={cat}
            />)
          }</Menu>
        </Popover>
      </div>
      <TextField
        hintText='Search'
        onChange={ ev => setQuery(ev.target.value) }
        value={query}
      />
    </div>
  }

}
