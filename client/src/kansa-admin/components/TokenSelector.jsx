import { Map } from 'immutable'
import { List, ListItem, makeSelectable } from 'material-ui/List'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

const TOKEN_LENGTH = 6

let SelectableList = makeSelectable(List);

export default class TokenSelector extends Component {
  state = {
    error: null,
    sent: false,
    query: ''
  }

  setTokenQuery = (_, query) => {
    const { api, onAdd } = this.props
    const { sent } = this.state
    if (sent) return
    query = query.toUpperCase().replace(/[^A-Z0-9]/g, '').substr(0, TOKEN_LENGTH)
    if (query.length < TOKEN_LENGTH) {
      this.setState({ query })
    } else {
      this.setState({ error: null, query: `${query}...`, sent: true })
      api.GET(`siteselect/tokens/${query}`)
        .then(token => {
          if (token.used) {
            this.setState({ error: `Token ${query} already used`, query: '', sent: false })
          } else {
            onAdd(token)
            this.setState({ query: '', sent: false })
          }
        })
        .catch(err => {
          const error = err.error === 'not found' ? `Token ${query} not found` : err.message
          this.setState({ error, query: '', sent: false })
        })
    }
  }

  render () {
    const { api, onAdd, onSelect, selected, tokens } = this.props
    const { error, query, sent } = this.state
    return (
      <Paper zDepth={1}>
        <div style={{ alignItems: 'baseline', display: 'flex', padding: '0 16px' }}>
          <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Add token:</span>
          <TextField
            disabled={sent}
            errorText={error}
            name='query'
            onChange={this.setTokenQuery}
            style={{ marginBottom: (error ? 16 : 0), marginLeft: 16 }}
            value={query}
          />
        </div>
        <SelectableList
          onChange={(_, token) => onSelect(token)}
          style={{ padding: 0 }}
          value={selected}
        >
          {tokens.map((token) => (
            <ListItem
              key={token.token}
              value={token}
              primaryText={`Token: ${token.token}`}
              secondaryText={`Paid by: ${token.payment_email}`}
            />
          ))}
          <ListItem
            value={null}
            primaryText='Payment by cash or card'
          />
        </SelectableList>
      </Paper>
    )
  }
}
