import type { DesktopTheme } from "./types"

const mods = import.meta.glob("./themes/*.json", { eager: true })

export const DEFAULT_THEMES = Object.values(mods)
  .map((item) => ("default" in item ? item.default : item) as DesktopTheme)
  .sort((a, b) => {
    if (a.id === "linear") return -1
    if (b.id === "linear") return 1
    return a.name.localeCompare(b.name)
  })
  .reduce<Record<string, DesktopTheme>>((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})
