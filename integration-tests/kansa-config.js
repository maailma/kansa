const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const configPath = path.resolve(__dirname, '../config/kansa.yaml')
module.exports = YAML.parse(fs.readFileSync(configPath, 'utf8'))
