const timestring = require('timestring')

const getIn = (config, path) => {
  let value = config
  path.forEach(p => {
    value = value[p]
  })
  return value
}

module.exports = function parseConfig(config, path, shape) {
  const key = path.join('.')
  const value = getIn(config, path)
  if (shape instanceof RegExp) {
    if (typeof value !== 'string') {
      throw new Error(
        `Expected string value for '${key}', but found ${typeof value}`
      )
    }
    if (!shape.test(value)) {
      throw new Error(
        `Expected value for '${key}' to match regular expression ${shape}`
      )
    }
  } else if (Array.isArray(shape)) {
    if (!Array.isArray(value)) {
      throw new Error(
        `Expected array value for '${key}', but found ${typeof value}`
      )
    }
    value.forEach((v, i) => {
      parseConfig(config, path.concat(i), shape[0])
    })
  } else if (typeof shape === 'object') {
    if (typeof value !== 'object') {
      throw new Error(
        key
          ? `Expected object value for '${key}', but found ${typeof value}`
          : `Expected configuration object, but found ${typeof value}`
      )
    }
    Object.keys(shape).forEach(k => {
      parseConfig(config, path.concat(k), shape[k])
    })
  } else if (shape === 'duration') {
    if (typeof value !== 'string') {
      throw new Error(
        `Expected string duration value for '${key}', but found ${typeof value}`
      )
    }
    const duration = timestring(value, 'ms')
    if (duration === 0) {
      throw new Error(
        /\d/.test(value)
          ? `Duration suffix not recognised for '${key}'`
          : `Expected positive duration value for '${key}'`
      )
    }
    const k = path.pop()
    const parent = getIn(config, path)
    parent[k] = duration
  } else if (typeof value !== shape) {
    throw new Error(
      `Expected ${shape} value for '${key}', but found ${typeof value}`
    )
  }
}
