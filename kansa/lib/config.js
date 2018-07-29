const fs = require('fs')
const YAML = require('yaml').default

const src = fs.readFileSync('/kansa.yaml', 'utf8')
const config = YAML.parse(src)

const shape = {
  id: /^\w+$/,
  name: 'string',
  paid_paper_pubs: 'boolean'
}

function checkConfig(key, config, shape) {
  if (shape instanceof RegExp) {
    if (typeof config !== 'string') {
      throw new Error(`Expected string value for '${key}', but found ${typeof config}`)
    }
    if (!shape.test(config)) {
      throw new Error(`Expected value for '${key}' to match regular expression ${shape}`)
    }
  } else if (typeof shape === 'object') {
    if (typeof config !== 'object') {
      throw new Error(key
        ? `Expected object value for '${key}', but found ${typeof config}`
        : `Expected configuration object, but found ${typeof config}`
      )
    }
    Object.keys(shape).forEach(k => {
      checkConfig(key ? `${key}.${k}` : k, config[k], shape[k])
    })
  } else if (typeof config !== shape) {
    throw new Error(`Expected ${shape} value for '${key}', but found ${typeof config}`)
  }
}
checkConfig('', config, shape)

module.exports = config
