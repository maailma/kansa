import { createContext } from 'react'
import api from './api'

export const defaultConfig = {
  getMemberAttr: () => ({})
}

const ctx = createContext(defaultConfig)
export const ConfigProvider = ctx.Provider
export const ConfigConsumer = ctx.Consumer

export const getConfig = () =>
  api.GET('config').then(config => {
    config.getMemberAttr = member => {
      const ms = member && member.get('membership')
      return (ms && config.membershipTypes[ms]) || {}
    }
    return config
  })
