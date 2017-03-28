import React, { PropTypes } from 'react'
import IconButton from 'material-ui/IconButton'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import FindReplace from 'material-ui/svg-icons/action/find-replace'

import MemberLookupForm from './MemberLookupForm'
import { PersonPropTypes } from '../reducers/user'

const MemberLabel = ({ title, subtitle }) => (
  <div>
    {title}
    <div style={{ fontSize: 'smaller', color: 'rgba(0, 0, 0, 0.3)' }}>
      {subtitle}
    </div>
  </div>
);

const ResetFindButton = ({ onReset }) => (
  <IconButton
    iconStyle={{ color: 'rgba(0, 0, 0, 0.5)' }}
    onTouchTap={onReset}
    style={{
      height: 'initial',
      marginLeft: 24,
      padding: 4,
      zIndex: 2
    }}
    tooltip="Find another member"
    tooltipStyles={{ top: 24 }}
  >
    <FindReplace />
  </IconButton>
);

export default class MemberLookupSelector extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    people: PersonPropTypes.people.isRequired,
    selectedPersonId: PropTypes.number
  }

  state = {
    foundPerson: null
  }

  render() {
    const { formStyle, onChange, people, selectedPersonId } = this.props;
    const { foundPerson } = this.state;
    return <div>
      <RadioButtonGroup
        name="person"
        onChange={(ev, person_id) => {
          const person = people.find(p => p.get('id') === person_id);
          if (person) {
            onChange({ name: person.get('legal_name'), person_id });
            this.setState({ foundPerson: null })
          } else {
            onChange({ name: '', person_id: 0 });
          }
        }}
        valueSelected={selectedPersonId}
      >
        {people.entrySeq().map(([i, person]) => (
          <RadioButton
            key={i}
            iconStyle={{ alignSelf: 'center' }}
            label={<MemberLabel
              title={person.get('legal_name')}
              subtitle={person.get('membership')}
            />}
            labelStyle={{ lineHeight: 'normal' }}
            style={{ marginBottom: 8 }}
            value={person.get('id')}
          />
        ))}
        <RadioButton
          iconStyle={{ alignSelf: 'center' }}
          label={foundPerson ? <div style={{ display: 'flex' }}>
            <MemberLabel
              title={foundPerson.name}
              subtitle={foundPerson.membership}
            />
            <ResetFindButton
              onReset={() => {
                onChange({ name: '', person_id: 0 });
                this.setState({ foundPerson: null });
              }}
            />
          </div> : <MemberLabel
            title="Other member..."
            subtitle="Find using name and/or email address"
          />}
          labelStyle={{ lineHeight: 'normal' }}
          style={{ marginBottom: 8 }}
          value={foundPerson ? foundPerson.id : 0}
        />
      </RadioButtonGroup>
      {selectedPersonId ? null : <MemberLookupForm
        style={{ marginLeft: 32 }}
        onQueryResults={({ results }) => {
          if (results.get('status') === 'success') {
            const foundPerson = results.toJS();
            onChange({ name: foundPerson.name, person_id: foundPerson.id });
            this.setState({ foundPerson });
          } else if (foundPerson) {
            onChange({ name: '', person_id: 0 });
            this.setState({ foundPerson: null });
          }
        }}
      />}
    </div>
  }
}
