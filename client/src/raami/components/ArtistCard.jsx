import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton'
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import OpenInNew from 'material-ui/svg-icons/action/open-in-new'

import { BasicRulesDialog } from './basic-rules';

const labelStyle = {
  color: '#888',
  fontSize: 16
};

const ArtistCard = ({ artist: { agent, continent, description, legal, name, transport, url }, onChange, onSave, style }) => <Card style={style}>
  <CardHeader style={{ fontWeight: 600 }} title="Artist information"/>
  <CardText>
    <p>
      Please fill in the general fields to register to the W75 art show.
      You can come back to edit this form and fill in details concerning
      individual art works later. The fee is a preliminary estimate and
      may change. Payment will be due in April by the latest. Please wait
      for confirmation and an invoice from the art show before attempting
      to pay. Changes and additions to this form will be notified by email.
    </p>

    <TextField
      floatingLabelStyle={labelStyle}
      floatingLabelText="Artist name"
      fullWidth={true}
      onChange={ev => onChange({ name: ev.target.value })}
      value={name}
    />
    <TextField
      floatingLabelStyle={labelStyle}
      floatingLabelText="Website URL"
      fullWidth={true}
      onChange={ev => onChange({ url: ev.target.value })}
      value={url}
    />
    <TextField
      floatingLabelStyle={labelStyle}
      floatingLabelText="Short description for catalogue/website (500 characters)"
      fullWidth={true}
      multiLine={true}
      onChange={ev => onChange({ description: ev.target.value })}
      rows={5}
      value={description}
    />
    <SelectField
      floatingLabelStyle={labelStyle}
      floatingLabelText="Continent for tax purposes"
      fullWidth={true}
      onChange={(ev, key, value) => onChange({ continent: value })}
      value={continent}
    >
      <MenuItem value="EU" primaryText="EU" />
      <MenuItem value="NON-EU" primaryText="NON-EU" />
    </SelectField>
    <SelectField
      floatingLabelStyle={labelStyle}
      floatingLabelText="Select Transportation method"
      fullWidth={true}
      onChange={(ev, key, value) => onChange({ transport: value })}
      value={transport}
    >
      <MenuItem value="Air mail" primaryText="Air mail" />
      <MenuItem value="Courier" primaryText="Courier" />
      <MenuItem value="Self" primaryText="Deliver self" />
    </SelectField>
    <TextField
      floatingLabelStyle={labelStyle}
      floatingLabelText="Agent name and contact details (if applicable)"
      fullWidth={true}
      multiLine={true}
      onChange={ev => onChange({ agent: ev.target.value })}
      rows={3}
      value={agent}
    />
  </CardText>

  <CardActions style={{ alignItems: 'center', display: 'flex', padding: 16 }}>
    <Checkbox
      checked={legal}
      labelStyle={labelStyle}
      onCheck={(ev, value) => onChange({ legal: value })}
      style={{ width: 'auto' }}
    />
    <div style={ Object.assign({ flexGrow: 1 }, labelStyle) }>
      I accept the{' '}
      <BasicRulesDialog>
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
          Worldcon 75 Art Show Basic Rules
          <OpenInNew style={{ color: '#888', height: 16, marginLeft: 2, position: 'relative', top: 3 }} />
        </span>
      </BasicRulesDialog>
    </div>
    <RaisedButton
      disabled={!legal}
      label="Save"
      onClick={onSave}
      primary={true}
      type="submit"
    />
  </CardActions>

</Card>;

ArtistCard.propTypes = {
  artist: PropTypes.shape({
    agent: PropTypes.string,
    continent: PropTypes.string,
    description: PropTypes.string,
    legal: PropTypes.boolean,
    name: PropTypes.string,
    transport: PropTypes.string,
    url: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ArtistCard;
