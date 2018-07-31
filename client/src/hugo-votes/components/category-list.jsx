import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton'
import { List, ListItem, makeSelectable } from 'material-ui/List'
import Popover from 'material-ui/Popover'
import ContentClear from 'material-ui/svg-icons/content/clear'
import NoNumber from 'material-ui/svg-icons/image/crop-free'
import Blank1 from 'material-ui/svg-icons/image/filter-1'
import Blank2 from 'material-ui/svg-icons/image/filter-2'
import Blank3 from 'material-ui/svg-icons/image/filter-3'
import Blank4 from 'material-ui/svg-icons/image/filter-4'
import Blank5 from 'material-ui/svg-icons/image/filter-5'
import Blank6 from 'material-ui/svg-icons/image/filter-6'
import Blank7 from 'material-ui/svg-icons/image/filter-7'
import Number1 from 'material-ui/svg-icons/image/looks-one'
import Number2 from 'material-ui/svg-icons/image/looks-two'
import Number3 from 'material-ui/svg-icons/image/looks-3'
import Number4 from 'material-ui/svg-icons/image/looks-4'
import Number5 from 'material-ui/svg-icons/image/looks-5'
import Number6 from 'material-ui/svg-icons/image/looks-6'
import PropTypes from 'prop-types'
import React from 'react'

import Number7 from '../../lib/looks-7'
import * as VotePropTypes from '../proptypes'

const SelectableList = makeSelectable(List)

const getIcon = (n, entry) => {
  switch (n) {
    case 0: return entry ? <Number1 /> : <Blank1 />
    case 1: return entry ? <Number2 /> : <Blank2 />
    case 2: return entry ? <Number3 /> : <Blank3 />
    case 3: return entry ? <Number4 /> : <Blank4 />
    case 4: return entry ? <Number5 /> : <Blank5 />
    case 5: return entry ? <Number6 /> : <Blank6 />
    case 6: return entry ? <Number7 /> : <Blank7 />
    default: return <NoNumber />
  }
}

export default class CategoryList extends React.Component {
  static propTypes = {
    finalists: VotePropTypes.categoryFinalists.isRequired,
    preference: VotePropTypes.categoryVotes.isRequired,
    setPreference: PropTypes.func.isRequired
  }

  state = {
    popAnchor: null,
    popEntry: null,
    popIdx: 0,
    popOpen: false
  }

  getActionText (idx) {
    const { popIdx, popEntry } = this.state
    switch (idx) {
      case popIdx: return this.getPrimaryText(popEntry)
      case -1: return 'Remove from ballot'
      default: return `Move to position ${idx + 1}`
    }
  }

  getPrimaryText (entry) {
    return entry ? entry.get('title', '[title]') : <span style={{ color: 'rgba(0, 0, 0, 0.541176)' }}>[No entry]</span>
  }

  getSecondaryText (entry) {
    return entry ? entry.get('subtitle', '') : 'Tap to remove'
  }

  listItemProps = (entry) => ({
    primaryText: this.getPrimaryText(entry),
    secondaryText: this.getSecondaryText(entry),
    secondaryTextLines: 1
  });

  openPopover = (event, idx, entry) => {
    event.preventDefault()
    this.setState({
      popAnchor: event.currentTarget,
      popEntry: entry,
      popIdx: idx,
      popOpen: true
    })
  }

  setPreference = (idx, fi) => {
    let { preference } = this.props
    if (fi) {
      let prevIdx
      do {
        prevIdx = preference.keyOf(fi)
        if (typeof prevIdx !== 'number') break
        if (prevIdx === idx) return
        if (prevIdx < idx) {
          preference = preference.set(prevIdx, null)
        } else {
          preference = preference.delete(prevIdx)
        }
      } while (preference.size)
      if (preference.get(idx)) {
        if (preference.size >= 7) ++idx
        preference = preference.insert(idx, fi)
      } else {
        preference = preference.set(idx, fi)
      }
    } else {
      preference = preference.delete(idx)
    }
    while (preference.size && !preference.last()) {
      preference = preference.pop()
    }
    while (preference.size > 7) {
      const emptyIdx = preference.findLastKey(e => !e)
      if (typeof emptyIdx !== 'number') break
      preference = preference.delete(emptyIdx)
    }
    this.props.setPreference(preference)
  }

  render () {
    const { finalists, preference } = this.props
    const { popAnchor, popEntry, popIdx, popOpen } = this.state
    const pFinalists = preference.map(fi => finalists.get(fi))
    const npFinalists = finalists.toList().filter(entry => !pFinalists.includes(entry))

    return (
      <List>
        {pFinalists.map((entry, idx) => (
          <ListItem
            className='vote-item'
            key={'p' + idx}
            leftIcon={getIcon(idx, entry)}
            onClick={(ev) => {
              if (entry) this.openPopover(ev, idx, entry)
              else this.setPreference(idx, null)
            }}
            rightIconButton={<IconButton
              iconStyle={{ color: 'rgba(0, 0, 0, 0.541176)' }}
              onClick={() => this.setPreference(idx, null)}
              tooltip='Remove this entry'
            ><ContentClear /></IconButton>}
            {...this.listItemProps(entry)}
          />
        ))}

        {pFinalists.size && npFinalists.size ? <Divider /> : null}

        {npFinalists.map((entry, idx) => (
          <ListItem
            className='vote-item'
            key={'n' + idx}
            leftIcon={<NoNumber />}
            onClick={(ev) => this.openPopover(ev, -1, entry)}
            {...this.listItemProps(entry)}
          />
        ))}

        <Popover
          anchorEl={popAnchor}
          open={popOpen}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={() => this.setState({ popOpen: false })}
        >
          <SelectableList
            onChange={(ev, idx) => {
              if (idx < 0) this.setPreference(popIdx, null)
              else this.setPreference(idx, popEntry.get('id'))
              this.setState({ popOpen: false })
            }}
            style={{ padding: 0 }}
            value={popIdx}
          >
            {[0, 1, 2, 3, 4, 5, 6, -1].map(idx => (
              <ListItem
                key={'pop' + idx}
                leftIcon={getIcon(idx, popEntry)}
                primaryText={this.getActionText(idx)}
                value={idx}
              />
            ))}
          </SelectableList>
        </Popover>
      </List>
    )
  }
}
