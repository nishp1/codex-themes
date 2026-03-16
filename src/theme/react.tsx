import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react"
import { DEFAULT_THEMES } from "./default-themes"
import { resolveThemeVariant, themeToCss } from "./resolve"
import type { DesktopTheme } from "./types"

type Scheme = "light" | "dark" | "system"
type Mode = "light" | "dark"

type Ctx = {
  id: string
  mode: Mode
  scheme: Scheme
  themes: Record<string, DesktopTheme>
  setTheme: (id: string) => void
  setScheme: (scheme: Scheme) => void
  previewTheme: (id: string) => void
  previewScheme: (scheme: Scheme) => void
  cancel: () => void
}

const KEY = {
  id: "codex-themes-id",
  scheme: "codex-themes-scheme",
  light: "codex-themes-css-light",
  dark: "codex-themes-css-dark",
} as const

const STYLE = "codex-theme"
const Ctx = createContext<Ctx | null>(null)

function sys() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function modeOf(scheme: Scheme): Mode {
  return scheme === "system" ? sys() : scheme
}

function node() {
  const prev = document.getElementById(STYLE) as HTMLStyleElement | null
  if (prev) return prev
  const el = document.createElement("style")
  el.id = STYLE
  document.head.appendChild(el)
  return el
}

function css(theme: DesktopTheme, mode: Mode) {
  const dark = mode === "dark"
  return themeToCss(resolveThemeVariant(dark ? theme.dark : theme.light, dark))
}

function cache(theme: DesktopTheme) {
  localStorage.setItem(KEY.light, css(theme, "light"))
  localStorage.setItem(KEY.dark, css(theme, "dark"))
}

function paint(theme: DesktopTheme, id: string, mode: Mode) {
  const dark = mode === "dark"
  const text = `:root {
  color-scheme: ${mode};
  --text-mix-blend-mode: ${dark ? "plus-lighter" : "multiply"};
  ${css(theme, mode)}
}`
  document.getElementById("codex-theme-preload")?.remove()
  node().textContent = text
  document.documentElement.dataset.theme = id
  document.documentElement.dataset.colorScheme = mode
}

export function ThemeProvider(props: { children: ReactNode }) {
  const [themes] = useState(DEFAULT_THEMES)
  const [id, setId] = useState("linear")
  const [scheme, setSchemeState] = useState<Scheme>("system")
  const [pid, setPid] = useState<string | null>(null)
  const [pscheme, setPScheme] = useState<Scheme | null>(null)
  const [mode, setMode] = useState<Mode>(() => (typeof window === "undefined" ? "light" : sys()))

  useEffect(() => {
    const id = localStorage.getItem(KEY.id)
    const scheme = localStorage.getItem(KEY.scheme) as Scheme | null
    if (id && themes[id]) setId(id)
    if (scheme) {
      setSchemeState(scheme)
      setMode(modeOf(scheme))
    }
    const item = themes[id ?? "linear"] ?? themes.linear
    if (item) cache(item)
  }, [themes])

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onMedia = () => {
      if (scheme === "system") setMode(sys())
      if (pscheme === "system") setMode(sys())
    }
    const onStore = (evt: StorageEvent) => {
      if (evt.key === KEY.id && evt.newValue && themes[evt.newValue]) setId(evt.newValue)
      if (evt.key === KEY.scheme && evt.newValue) {
        const next = evt.newValue as Scheme
        setSchemeState(next)
        setMode(modeOf(next))
      }
    }
    media.addEventListener("change", onMedia)
    window.addEventListener("storage", onStore)
    return () => {
      media.removeEventListener("change", onMedia)
      window.removeEventListener("storage", onStore)
    }
  }, [pscheme, scheme, themes])

  const aid = pid ?? id
  const ascheme = pscheme ?? scheme
  const amode = modeOf(ascheme)
  const item = themes[aid] ?? themes.linear

  useLayoutEffect(() => {
    if (!item) return
    paint(item, aid, amode)
  }, [aid, amode, item])

  return (
    <Ctx.Provider
      value={{
        id,
        mode,
        scheme,
        themes,
        setTheme: (id) => {
          const item = themes[id]
          if (!item) return
          setId(id)
          setPid(null)
          localStorage.setItem(KEY.id, id)
          cache(item)
          setMode(modeOf(scheme))
        },
        setScheme: (scheme) => {
          setSchemeState(scheme)
          setPScheme(null)
          localStorage.setItem(KEY.scheme, scheme)
          setMode(modeOf(scheme))
        },
        previewTheme: (id) => {
          if (!themes[id]) return
          setPid(id)
        },
        previewScheme: (scheme) => {
          setPScheme(scheme)
        },
        cancel: () => {
          setPid(null)
          setPScheme(null)
          setMode(modeOf(scheme))
        },
      }}
    >
      {props.children}
    </Ctx.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (ctx) return ctx
  throw new Error("useTheme must be used within ThemeProvider")
}
