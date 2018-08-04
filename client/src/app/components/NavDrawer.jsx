import { List as ImmutableList } from 'immutable'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'

import Drawer from 'material-ui/Drawer'

import NavHead from './NavHead'
import NavMenu from './NavMenu'

class NavDrawer extends React.Component {
  static propTypes = {
    docked: PropTypes.bool,
    id: PropTypes.number,
    onRequestChange: PropTypes.func.isRequired,
    open: PropTypes.bool,
    people: ImmutablePropTypes.list.isRequired,
    push: PropTypes.func.isRequired,
    width: PropTypes.number
  }

  static currentMember(id, people) {
    if (!people || people.size === 0) return null
    if (people.size === 1) return people.first()
    if (id) return people.find(p => p.get('id') === id)
    const nonKids = people.filter(
      p => ['KidInTow', 'Child'].indexOf(p.get('membership')) === -1
    )
    return nonKids.size === 1 ? nonKids.first() : null
  }

  static otherMembers(currentMember, people) {
    if (!people || people.size === 0) return null
    const id = currentMember && currentMember.get('id')
    if (!id) return people
    const om = people.filter(p => p.get('id') !== id)
    return om.size > 0 ? om : null
  }

  constructor(props) {
    super(props)
    const { id, people } = this.props
    const currentMember = NavDrawer.currentMember(id, people)
    const otherMembers = NavDrawer.otherMembers(currentMember, people)
    this.state = {
      currentMember,
      otherMembers
    }
  }

  componentWillReceiveProps({ id, people }) {
    const currentMember = NavDrawer.currentMember(id, people)
    const otherMembers = NavDrawer.otherMembers(currentMember, people)
    this.setState({
      currentMember,
      otherMembers
    })
  }

  handleNav = val => {
    const { onRequestChange, push } = this.props
    push(val)
    onRequestChange(false)
  }

  render() {
    const { docked, onRequestChange, open, width } = this.props
    const { currentMember, otherMembers } = this.state

    return (
      <Drawer
        docked={docked}
        open={docked || open}
        onRequestChange={onRequestChange}
        width={width}
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
    )
  }
}

export default connect(
  ({ user }) => ({
    people: user.get('people') || ImmutableList()
  }),
  {
    push
  }
)(NavDrawer)
