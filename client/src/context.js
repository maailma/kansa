import React, { Component, createContext } from 'react'

import importModule from './import-modules'
import { ConfigProvider, defaultConfig, getConfig } from './lib/config-context'

const ModuleContext = createContext([])
export const ModuleConsumer = ModuleContext.Consumer

function loadModules(config) {
  const names = []
  const imports = []
  Object.keys(config.modules).forEach(name => {
    if (config.modules[name]) {
      const mi = importModule(name)
      if (mi) {
        names.push(name)
        imports.push(mi)
      }
    }
  })
  return Promise.all(imports).then(mods => {
    const modules = []
    for (let i = 0; i < mods.length; ++i) {
      const mf = mods[i].default
      const mod = mf(config)
      mod.name = names[i]
      modules.push(mod)
    }
    return modules
  })
}

export default class AppContext extends Component {
  state = { config: defaultConfig, modules: [] }

  componentDidMount() {
    getConfig().then(config => {
      this.setState({ config })
      loadModules(config).then(modules => this.setState({ modules }))
    })
  }

  render() {
    const { config, modules } = this.state
    return (
      <ConfigProvider value={config}>
        <ModuleContext.Provider value={modules}>
          {this.props.children}
        </ModuleContext.Provider>
      </ConfigProvider>
    )
  }
}
