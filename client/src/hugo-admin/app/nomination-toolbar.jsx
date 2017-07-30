import IconButton from 'material-ui/IconButton'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import Popover from 'material-ui/Popover'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import BallotCountIcon from 'material-ui/svg-icons/editor/format-list-numbered'
import CatInfoIcon from 'material-ui/svg-icons/action/info-outline'
import NominationsIcon from 'material-ui/svg-icons/action/list'
import FinalistsIcon from 'material-ui/svg-icons/image/filter-6'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { categoryInfo } from '../../hugo-nominations/constants'
import { setShowBallotCounts } from '../actions'
import { HUGO_ADMIN_ROUTE_ROOT, categoryGroups } from '../constants'
import CategoryInfo from './category-info'

class NominationToolbar extends Component {

  static propTypes = {
    category: PropTypes.string.isRequired,
    pathname: PropTypes.string.isRequired,
    query: PropTypes.string,
    setQuery: PropTypes.func.isRequired,
    setShowBallotCounts: PropTypes.func.isRequired,
    showBallotCounts: PropTypes.bool.isRequired,
    showFinalists: PropTypes.func.isRequired,
    showNominations: PropTypes.func.isRequired
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

  get showBallotCountButton() {
    const { setShowBallotCounts, showBallotCounts } = this.props;
    if (this.currentView !== 'nominations') return null;
    return (
      <IconButton
        iconStyle={ showBallotCounts ? { color: 'rgb(0, 188, 212)' } : null }
        onTouchTap={ () => setShowBallotCounts(!showBallotCounts) }
        tooltip={`${showBallotCounts ? 'Hide' : 'Show'} ballot counts`}
      >
        <BallotCountIcon />
      </IconButton>
    );
  }

  render() {
    const { category, query, setQuery } = this.props
    const { anchorEl, menuOpen } = this.state
    return (
      <Paper className='toolbar'>
        <div>
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
            <Menu>
              {Object.keys(categoryGroups).reduce((items, gn) => items.concat(
                this.categoryMenuItem(gn, null),
                categoryGroups[gn].map(category => this.categoryMenuItem(category, gn))
              ), [])}
            </Menu>
          </Popover>
          {this.categoryViewButton}
          {this.showBallotCountButton}
          {this.categoryInfoButton}
          {this.currentView === 'nominations' ? (
            <TextField
              hintText='Search'
              onChange={ ev => setQuery(ev.target.value) }
              style={{ paddingLeft: 12 }}
              value={query}
            />
          ): null}
        </div>
      </Paper>
    )
  }
}

export default connect(null,
  {
    setShowBallotCounts,
    showNominations: category => push(`${HUGO_ADMIN_ROUTE_ROOT}/${category}/nominations`),
    showFinalists: category => push(`${HUGO_ADMIN_ROUTE_ROOT}/${category}/finalists`)
  }
)(NominationToolbar);
