import { List as ImmutableList } from 'immutable';
import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
const ImmutablePropTypes = require('react-immutable-proptypes');

import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import Menu from 'material-ui/svg-icons/navigation/menu'

import NavHead from './NavHead'
import NavMenu from './NavMenu'

class NavDrawer extends React.Component {

  static propTypes = {
    iconStyle: React.PropTypes.object,
    id: React.PropTypes.number,
    people: ImmutablePropTypes.list.isRequired,
    push: React.PropTypes.func.isRequired,
  };

  static currentMember(id, people) {
    if (!people || people.size === 0) return null;
    if (people.size === 1) return people.first();
    if (id) return people.find(p => p.get('id') === id);
    const nonKids = people.filter(p => ['KidInTow', 'Child'].indexOf(p.get('membership')) === -1);
    return nonKids.size === 1 ? nonKids.first() : null;
  }

  static otherMembers(currentMember, people) {
    if (!people || people.size === 0) return null;
    const id = currentMember && currentMember.get('id');
    if (!id) return people;
    const om = people.filter(p => p.get('id') !== id);
    return om.size > 0 ? om : null;
  }

  constructor(props) {
    super(props);
    const { id, people } = this.props;
    const currentMember = NavDrawer.currentMember(id, people);
    const otherMembers = NavDrawer.otherMembers(currentMember, people);
    this.state = {
      currentMember,
      open: false,
      otherMembers,
    };
  }

  componentWillReceiveProps({ id, people }) {
    const currentMember = NavDrawer.currentMember(id, people);
    const otherMembers = NavDrawer.otherMembers(currentMember, people);
    this.setState({
      currentMember,
      otherMembers,
    });
  }

  handleNav = (val) => {
    console.log('nav', val);
    this.props.push(val);
    this.setState({ open: false });
  }

  render() {
    const { iconStyle } = this.props;
    const { currentMember, open, otherMembers } = this.state;

    return <div>
      <IconButton
        onTouchTap={() => this.setState({ open: true })}
        style={iconStyle}
        tooltip='Navigation menu'
        tooltipPosition='bottom-right'
        tooltipStyles={{ marginTop: -8 }}
      >
        <Menu />
      </IconButton>
      <Drawer
        docked={false}
        open={open}
        onRequestChange={(open) => this.setState({ open })}
      >
        <NavHead
          currentMember={currentMember}
          handleNav={this.handleNav}
          otherMembers={otherMembers}
        />
        <NavMenu
          currentMember={currentMember}
          handleNav={this.handleNav}
          otherMembers={otherMembers}
        />
      </Drawer>
    </div>
  }
}

export default connect(
  ({ user }) => ({
    people: user.get('people') || ImmutableList(),
  }), {
    push
  }
)(NavDrawer);
