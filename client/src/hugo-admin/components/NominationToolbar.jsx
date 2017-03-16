import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import DownloadIcon from 'material-ui/svg-icons/file/cloud-download'
import CatInfoIcon from 'material-ui/svg-icons/action/info-outline'
import NominationsIcon from 'material-ui/svg-icons/action/list'
import FinalistsIcon from 'material-ui/svg-icons/image/filter-6'
import IconButton from 'material-ui/IconButton'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import { categoryInfo } from '../../hugo/constants';
import { fetchAllBallots } from '../actions'
import { HUGO_ADMIN_ROUTE_ROOT, categoryGroups } from '../constants';
import CategoryInfo from './CategoryInfo'

class NominationToolbar extends React.Component {

  static propTypes = {
    category: React.PropTypes.string.isRequired,
    fetchAllBallots: React.PropTypes.func.isRequired,
    pathname: React.PropTypes.string.isRequired,
    query: React.PropTypes.string,
    setQuery: React.PropTypes.func.isRequired,
    showFinalists: React.PropTypes.func.isRequired,
    showNominations: React.PropTypes.func.isRequired
  }

  state = {
    anchorEl: null,
    infoOpen: false,
    menuOpen: false
  }

  categoryMenuItem = (category, group) => {
    const { setQuery, showNominations } = this.props;
    return <MenuItem
      key={(group || '') + category}
      onTouchTap={ () => {
        this.setState({ menuOpen: false });
        showNominations(category);
        setQuery('');
      } }
      primaryText={ group ? `- ${category}` : category }
    />
  }

  get categoryInfoButton() {
    const { category } = this.props;
    const { infoOpen } = this.state;
    if (!categoryInfo[category]) return null;
    return [
      <IconButton
        key='cib'
        onTouchTap={() => this.setState({ infoOpen: true })}
        tooltip={`Show ${category} information`}
      >
        <CatInfoIcon />
      </IconButton>,
      <CategoryInfo
        category={infoOpen ? category : null}
        key='cid'
        onRequestClose={() => this.setState({ infoOpen: false })}
      />
    ];
  }

  get categoryViewButton() {
    const { category, showFinalists, showNominations } = this.props;
    if (!categoryInfo[category]) return null;
    return (this.currentView === 'nominations')
      ? <IconButton
          onTouchTap={ () => showFinalists(category) }
          tooltip={`Show ${category} finalists`}
        >
          <FinalistsIcon />
        </IconButton>
      : <IconButton
          onTouchTap={ () => showNominations(category) }
          tooltip={`Show ${category} nominations`}
        >
          <NominationsIcon />
        </IconButton>;
  }

  get currentView() {
    return this.props.pathname.replace(/.*\//, '');
  }

  openMenu = (event) => {
    event.preventDefault();
    this.setState({
      menuOpen: true,
      anchorEl: event.currentTarget
    });
  };

  render() {
    const { category, fetchAllBallots, query, setQuery } = this.props;
    const { anchorEl, menuOpen } = this.state;

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
        onTouchTap={this.openMenu}
        label={category}
        style={{ marginRight: 12 }}
      />
      <Popover
        open={menuOpen}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={ () => this.setState({ menuOpen: false }) }
      >
        <Menu>{
          Object.keys(categoryGroups).reduce((items, gn) => items.concat(
            this.categoryMenuItem(gn, null),
            categoryGroups[gn].map(category => this.categoryMenuItem(category, gn))
          ), [])
        }</Menu>
      </Popover>
      { this.categoryViewButton }
      { this.categoryInfoButton }
      <IconButton
        onTouchTap={fetchAllBallots}
        tooltip={'Refresh ballots'}
      >
        <DownloadIcon />
      </IconButton>
      {
        this.currentView === 'nominations' ? <TextField
          hintText='Search'
          onChange={ ev => setQuery(ev.target.value) }
          style={{ paddingLeft: 12 }}
          value={query}
        /> : null
      }
    </div>
  }
}

export default connect(null,
  {
    fetchAllBallots,
    showNominations: category => push(`${HUGO_ADMIN_ROUTE_ROOT}/${category}/nominations`),
    showFinalists: category => push(`${HUGO_ADMIN_ROUTE_ROOT}/${category}/finalists`)
  }
)(NominationToolbar);
