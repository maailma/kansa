import { createContext } from 'react'

const ctx = createContext({})
export const ConfigProvider = ctx.Provider
export const ConfigConsumer = ctx.Consumer
