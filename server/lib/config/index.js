const fs = require('fs')
const YAML = require('yaml').default
const parseConfig = require('./parse')

const src = fs.readFileSync('/kansa.yaml', 'utf8')
const config = YAML.parse(src)

const shape = {
  id: /^\w+$/,
  name: 'string',
  paid_paper_pubs: 'boolean',
  auth: {
    admin_roles: ['string'],
    key_timeout: {
      admin: 'duration',
      normal: 'duration'
    },
    session_timeout: 'duration'
  },
  modules: 'object'
}

parseConfig(config, [], shape)

module.exports = config
