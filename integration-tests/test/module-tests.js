require('chai/register-assert')
require('chai/register-expect')
const fs = require('fs')
const path = require('path')
const config = require('../kansa-config')
const testAgent = require('../test-agent')

const modulesDir = path.resolve(process.cwd(), '../modules')

const title = fn => {
  const base = path.basename(fn, '.js').replace(/\.spec$/, '')
  return base[0].toUpperCase() + base.slice(1)
}

for (const [name, value] of Object.entries(config.modules)) {
  if (!value) continue
  const testDir = path.resolve(modulesDir, name, 'server/test')
  try {
    const tests = fs
      .readdirSync(testDir)
      .filter(fn => !fn.startsWith('_') && path.extname(fn) === '.js')
    if (tests.length > 0) {
      describe(`Module: ${title(name)}`, () => {
        for (const fn of tests) {
          describe(title(fn), () => {
            const testPath = path.resolve(testDir, fn)
            const test = require(testPath)
            if (typeof test === 'function') test(testAgent, value, config)
          })
        }
      })
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}
