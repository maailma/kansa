import { Map } from 'immutable'
import React, { PropTypes } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

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

const SelectableList = makeSelectable(List);

const fieldLabel = (field) => field.charAt(0).toUpperCase() + field.substr(1);

const getIcon = (n, entry) => {
  switch (n) {
    case 0: return entry ? <Number1 /> : <Blank1 />;
    case 1: return entry ? <Number2 /> : <Blank2 />;
    case 2: return entry ? <Number3 /> : <Blank3 />;
    case 3: return entry ? <Number4 /> : <Blank4 />;
    case 4: return entry ? <Number5 /> : <Blank5 />;
    case 5: return entry ? <Number6 /> : <Blank6 />;
    case 6: return entry ? <Blank7 /> : <Blank7 />;
    default: return <NoNumber />;
  }
}

const noAwardEntry = Map({ 'no-award': true });

export default class VoteList extends React.Component {

  static propTypes = {
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    finalists: ImmutablePropTypes.listOf(ImmutablePropTypes.map).isRequired,
    preference: ImmutablePropTypes.listOf(ImmutablePropTypes.map).isRequired,
    setPreference: PropTypes.func.isRequired
  }

  state = {
    popAnchor: null,
    popEntry: null,
    popIdx: 0,
    popOpen: false,
  }

  getActionText(idx) {
    const { popIdx, popEntry } = this.state;
    switch (idx) {
      case popIdx: return this.getPrimaryText(popEntry);
      case -1: return 'Remove from ballot';
      default: return `Move to position ${idx + 1}`;
    }
  }

  getPrimaryText(entry) {
    if (noAwardEntry.equals(entry)) return 'No award';
    return entry && entry.get(this.props.fields[0]) || <span style={{ color: 'rgba(0, 0, 0, 0.541176)' }}>[No entry]</span>;
  }

  getSecondaryText(entry) {
    const { fields } = this.props;
    if (!entry) return 'Tap to remove';
    if (noAwardEntry.equals(entry)) return '';
    switch (fields.length) {
      case 1: return '';
      case 2: return fieldLabel(fields[1]) + ': ' + entry.get(fields[1]);
      default: return (
        <div>
          {fieldLabel(fields[1]) + ': ' + entry.get(fields[1])}
          <br />
          {fieldLabel(fields[2]) + ': ' + entry.get(fields[2])}
        </div>
      );
    }
  }

  listItemProps(entry) {
    return {
      primaryText: this.getPrimaryText(entry),
      secondaryText: this.getSecondaryText(entry),
      secondaryTextLines: this.props.fields.length > 2 ? 2 : 1
    }
  }

  openPopover = (event, idx, entry) => {
    event.preventDefault();
    this.setState({
      popAnchor: event.currentTarget,
      popEntry: entry,
      popIdx: idx,
      popOpen: true
    });
  }

  render() {
    const { fields, finalists, preference, setPreference } = this.props;
    const { popAnchor, popEntry, popIdx, popOpen } = this.state;
    const npFinalists = finalists.push(noAwardEntry).filter(entry => !preference.includes(entry));

    return (
      <List>
        {preference.map((entry, idx) => (
          <ListItem
            key={'p'+idx}
            leftIcon={getIcon(idx, entry)}
            onTouchTap={(ev) => {
              if (entry) this.openPopover(ev, idx, entry);
              else setPreference(idx, null);
            }}
            rightIconButton={<IconButton
              iconStyle={{ color: 'rgba(0, 0, 0, 0.541176)' }}
              onTouchTap={() => setPreference(idx, null)}
              tooltip="Remove this entry"
            ><ContentClear /></IconButton>}
            { ...this.listItemProps(entry) }
          />
        ))}

        {preference.size && npFinalists.size ? <Divider /> : null}

        {npFinalists.map((entry, idx) => (
          <ListItem
            key={'n'+idx}
            leftIcon={<NoNumber />}
            onTouchTap={(ev) => this.openPopover(ev, -1, entry)}
            { ...this.listItemProps(entry) }
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
              if (idx >= 0) setPreference(idx, popEntry);
              this.setState({ popOpen: false });
            }}
            style={{ padding: 0 }}
            value={popIdx}
          >
            {[0, 1, 2, 3, 4, 5, 6, -1].map(idx => (
              <ListItem
                key={'pop'+idx}
                leftIcon={getIcon(idx, popEntry)}
                primaryText={this.getActionText(idx)}
                value={idx}
              />
            ))}
          </SelectableList>
        </Popover>
      </List>
    );
  }
}
