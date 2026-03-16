import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Ctx } from "./ctx"
import { type Scheme, useAppearanceScheme, useThemeService } from "./service"
import { loadWithTheme, type Loaded, type Mode } from "./theme"
import { useResolvedThemeVariant } from "./use-resolved-theme-variant"

const KEY = {
  dark: "codex-themes-css-dark",
  light: "codex-themes-css-light",
} as const

const STYLE = "codex-theme"

function node() {
  const prev = document.getElementById(STYLE) as HTMLStyleElement | null
  if (prev) return prev
  const item = document.createElement("style")
  item.id = STYLE
  document.head.appendChild(item)
  return item
}

function text(vars: Record<string, string>, mode: Mode) {
  return `:root {\n  color-scheme: ${mode};\n  ${Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ")}\n}`
}

function body(vars: Record<string, string>) {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ")
}

function apply(mode: Mode, data: Loaded) {
  document.getElementById("codex-theme-preload")?.remove()
  node().textContent = text(data.vars, mode)
  document.documentElement.dataset.colorScheme = mode
  document.documentElement.dataset.theme = data.item.id
}

function parse(value: string | undefined): Scheme {
  return value === "light" || value === "dark" || value === "system" ? value : "system"
}

function tag(item: { id: string }, theme: object) {
  return JSON.stringify({ id: item.id, theme })
}

export function ThemeProvider(props: { children: ReactNode }) {
  const config = useAppearanceScheme()
  const scheme = parse(config.data)
  const mode = useResolvedThemeVariant(scheme)
  const light = useThemeService("light")
  const dark = useThemeService("dark")
  const active = mode === "light" ? light : dark
  const key = useMemo(() => tag(active.selectedCodeTheme, active.theme), [active.selectedCodeTheme, active.theme])
  const [data, setData] = useState<{ key: string; value: Loaded } | null>(null)
  const ready = data?.key === key

  useEffect(() => {
    let live = true
    loadWithTheme(active.selectedCodeTheme, mode, active.theme)
      .then((value) => {
        if (!live) return
        setData({ key, value })
        apply(mode, value)
        window.localStorage.setItem(mode === "light" ? KEY.light : KEY.dark, body(value.vars))
      })
      .catch((err: unknown) => {
        if (!live) return
        console.error(err)
      })
    return () => {
      live = false
    }
  }, [active.selectedCodeTheme, active.theme, key, mode])

  useEffect(() => {
    void loadWithTheme(light.selectedCodeTheme, "light", light.theme)
      .then((value) => window.localStorage.setItem(KEY.light, body(value.vars)))
      .catch((err: unknown) => console.error(err))
    void loadWithTheme(dark.selectedCodeTheme, "dark", dark.theme)
      .then((value) => window.localStorage.setItem(KEY.dark, body(value.vars)))
      .catch((err: unknown) => console.error(err))
  }, [dark.selectedCodeTheme, dark.theme, light.selectedCodeTheme, light.theme])

  return (
    <Ctx.Provider
      value={{
        active,
        dark,
        light,
        mode,
        ready,
        scheme,
        setScheme: (value) => {
          void config.setData(value)
        },
      }}
    >
      {props.children}
    </Ctx.Provider>
  )
}
