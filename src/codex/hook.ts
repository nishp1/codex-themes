import { useContext } from "react"
import { Ctx } from "./ctx"

export function useTheme() {
  const ctx = useContext(Ctx)
  if (ctx) return ctx
  throw new Error("useTheme must be used within ThemeProvider")
}
