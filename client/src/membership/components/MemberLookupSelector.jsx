import PropTypes from 'prop-types'
import React from 'react'
import IconButton from 'material-ui/IconButton'
import { List, ListItem, makeSelectable } from 'material-ui/List'
import FindReplace from 'material-ui/svg-icons/action/find-replace'
import Face from 'material-ui/svg-icons/action/face'
import Search from 'material-ui/svg-icons/action/search'
import ImmutablePropTypes from 'react-immutable-proptypes'

import * as MemberPropTypes from '../proptypes'
import MemberLookupForm from './MemberLookupForm'
import { memberTypeData } from './MemberTypeList'

const SelectableList = makeSelectable(List);

const ResetFindButton = ({ onReset }) => (
  <IconButton
    onTouchTap={onReset}
    tooltip="Find another member"
  >
    <FindReplace />
  </IconButton>
);

const getMemberIcon = (type) => {
  const typeData = memberTypeData[type];
  return typeData && typeData.icon || <Face />;
}

export default class MemberLookupSelector extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    people: MemberPropTypes.people.isRequired,
    requireMembership: ImmutablePropTypes.listOf(PropTypes.string),
    selectedPersonId: PropTypes.number
  }

  state = {
    foundPerson: null
  }

  componentWillMount() {
    const { people, selectedPersonId } = this.props;
    const person = people.find(p => p.get('id') === selectedPersonId);
    if (person && !this.allowSelect(person.get('membership'))) {
      const okPerson = people.find(p => this.allowSelect(p.get('membership')));
      this.onSelectPerson(null, okPerson && okPerson.get('id'));
    }
  }

  allowSelect(membership) {
    const { requireMembership } = this.props;
    return !requireMembership || requireMembership.includes(membership);
  }

  onSelectPerson = (ev, id) => {
    const { onChange, people, selectedPersonId } = this.props;
    const person = people.find(p => p.get('id') === id);
    if (person) {
      onChange({ membership: person.get('membership'), name: person.get('legal_name'), person_id: id });
      this.setState({ foundPerson: null })
    } else {
      onChange({ membership: null, name: '', person_id: 0 });
    }
  }

  render() {
    const { formStyle, onChange, people, selectedPersonId } = this.props;
    const { foundPerson } = this.state;
    return <div>
      <SelectableList
        onChange={this.onSelectPerson}
        value={selectedPersonId}
      >
        {people.entrySeq().map(([i, person]) => {
          const membership = person.get('membership');
          const disabled = !this.allowSelect(membership)
          return (
            <ListItem
              disabled={disabled}
              innerDivStyle={{ paddingLeft: 60 }}
              key={i}
              leftIcon={getMemberIcon(membership)}
              primaryText={person.get('legal_name')}
              secondaryText={membership}
              style={disabled ? { opacity: 0.3 } : null}
              value={person.get('id')}
            />
          )
        })}
        {foundPerson ? (
          <ListItem
            innerDivStyle={{ paddingLeft: 60 }}
            leftIcon={getMemberIcon(foundPerson.membership)}
            primaryText={foundPerson.name}
            rightIconButton={(
              <IconButton
                iconStyle={{ color: 'rgb(117, 117, 117)' }}
                onTouchTap={() => {
                  onChange({ membership: null, name: '', person_id: 0 });
                  this.setState({ foundPerson: null });
                }}
                tooltip="Find another member"
              ><FindReplace /></IconButton>
            )}
            secondaryText={foundPerson.membership}
            value={foundPerson.id}
          />
        ) : (
          <ListItem
            innerDivStyle={{ paddingLeft: 60 }}
            leftIcon={<Search />}
            primaryText="Other member..."
            secondaryText="Find using name and/or email address"
            value={0}
          />
        )}
      </SelectableList>
      {selectedPersonId ? null : <MemberLookupForm
        style={{ marginLeft: 52 }}
        onQueryResults={({ results }) => {
          if (results.get('status') === 'success') {
            const foundPerson = results.toJS();
            onChange({ membership: foundPerson.membership, name: foundPerson.name, person_id: foundPerson.id });
            this.setState({ foundPerson });
          } else if (foundPerson) {
            onChange({ membership: null, name: '', person_id: 0 });
            this.setState({ foundPerson: null });
          }
        }}
      />}
    </div>
  }
}
