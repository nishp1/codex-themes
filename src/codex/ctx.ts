import { createContext } from "react"
import type { Mode } from "./theme"
import type { Scheme, Service } from "./service"

export type State = {
  active: Service
  dark: Service
  light: Service
  mode: Mode
  ready: boolean
  scheme: Scheme
  setScheme: (scheme: Scheme) => void
}

export const Ctx = createContext<State | null>(null)
