import { useCallback, useMemo, useRef } from "react"
import {
  availableThemes,
  loadThemeSeed,
  normalizeThemeSeed,
  pickTheme,
  type Item,
  type Mode,
  type ThemePatch,
  type ThemeSeed,
} from "./source"
import { useConfig } from "./store"

export const config = {
  APPEARANCE_DARK_CHROME_THEME: "appearanceDarkChromeTheme",
  APPEARANCE_DARK_CODE_THEME_ID: "appearanceDarkCodeThemeId",
  APPEARANCE_LIGHT_CHROME_THEME: "appearanceLightChromeTheme",
  APPEARANCE_LIGHT_CODE_THEME_ID: "appearanceLightCodeThemeId",
  APPEARANCE_THEME: "appearanceTheme",
} as const

export const prefix = "codex-theme-v1:"

export type Scheme = "dark" | "light" | "system"

export type SharedTheme = {
  codeThemeId: string
  theme: ThemeSeed
  variant: Mode
}

export type Patch = Partial<ThemeSeed> & {
  fonts?: Partial<ThemeSeed["fonts"]>
  semanticColors?: Partial<ThemeSeed["semanticColors"]>
}

export type Service = {
  canImportThemeString: (value: string) => boolean
  codeThemes: Item[]
  exportThemeString: () => string
  fonts: ThemeSeed["fonts"]
  importThemeString: (value: string) => Promise<void>
  isDisabled: boolean
  selectedCodeTheme: Item
  setCodeThemeId: (id: string) => Promise<void>
  setFontsPatch: (patch: Partial<ThemeSeed["fonts"]>) => void
  setThemePatch: (patch: Patch | ThemePatch) => void
  theme: ThemeSeed
}

type State = {
  codeThemeId: string
  theme: ThemeSeed
}

function isHex(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)
}

function isText(value: unknown): value is string | null {
  return value == null || typeof value === "string"
}

function isMode(value: unknown): value is Mode {
  return value === "dark" || value === "light"
}

function parseTheme(value: unknown, mode: Mode) {
  if (typeof value !== "object" || value == null) throw new Error("Theme payload mismatch")
  const theme = value as Record<string, unknown>
  const contrast = theme.contrast
  if (!isHex(theme.accent)) throw new Error("Theme accent mismatch")
  if (typeof contrast !== "number" || !Number.isInteger(contrast) || contrast < 0 || contrast > 100) {
    throw new Error("Theme contrast mismatch")
  }
  if (!isHex(theme.ink)) throw new Error("Theme ink mismatch")
  if (typeof theme.opaqueWindows !== "boolean") throw new Error("Theme opaqueWindows mismatch")
  if (!isHex(theme.surface)) throw new Error("Theme surface mismatch")
  if (typeof theme.fonts !== "object" || theme.fonts == null) throw new Error("Theme fonts mismatch")
  if (typeof theme.semanticColors !== "object" || theme.semanticColors == null) throw new Error("Theme semanticColors mismatch")
  const fonts = theme.fonts as Record<string, unknown>
  const semantic = theme.semanticColors as Record<string, unknown>
  if (!isText(fonts.code) || !isText(fonts.ui)) throw new Error("Theme fonts mismatch")
  if (!isHex(semantic.diffAdded) || !isHex(semantic.diffRemoved) || !isHex(semantic.skill)) throw new Error("Theme semanticColors mismatch")
  return normalizeThemeSeed(
    {
      accent: theme.accent,
      contrast,
      fonts: { code: fonts.code ?? null, ui: fonts.ui ?? null },
      ink: theme.ink,
      opaqueWindows: theme.opaqueWindows,
      semanticColors: {
        diffAdded: semantic.diffAdded,
        diffRemoved: semantic.diffRemoved,
        skill: semantic.skill,
      },
      surface: theme.surface,
    },
    mode,
  )
}

function parseChrome(value: string | null, mode: Mode) {
  if (value == null || value.trim().length === 0) return undefined
  const item = JSON.parse(value) as unknown
  return parseTheme(item, mode)
}

function parseCode(value: string | null) {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function parseScheme(value: string | null): Scheme {
  return value === "light" || value === "dark" || value === "system" ? value : "system"
}

export function themeKeys(variant: Mode) {
  return variant === "light"
    ? {
        chromeThemeConfigurationKey: config.APPEARANCE_LIGHT_CHROME_THEME,
        codeThemeConfigurationKey: config.APPEARANCE_LIGHT_CODE_THEME_ID,
      }
    : {
        chromeThemeConfigurationKey: config.APPEARANCE_DARK_CHROME_THEME,
        codeThemeConfigurationKey: config.APPEARANCE_DARK_CODE_THEME_ID,
      }
}

export function mergeTheme(theme: ThemeSeed, patch: Patch | ThemePatch) {
  return {
    ...theme,
    ...patch,
    fonts: patch.fonts == null ? theme.fonts : { ...theme.fonts, ...patch.fonts },
    semanticColors: patch.semanticColors == null ? theme.semanticColors : { ...theme.semanticColors, ...patch.semanticColors },
  }
}

export function sameTheme(a: ThemeSeed, b: ThemeSeed) {
  return (
    a.accent === b.accent &&
    a.contrast === b.contrast &&
    a.fonts.code === b.fonts.code &&
    a.fonts.ui === b.fonts.ui &&
    a.ink === b.ink &&
    a.opaqueWindows === b.opaqueWindows &&
    a.semanticColors.diffAdded === b.semanticColors.diffAdded &&
    a.semanticColors.diffRemoved === b.semanticColors.diffRemoved &&
    a.semanticColors.skill === b.semanticColors.skill &&
    a.surface === b.surface
  )
}

export function sameState(a: State, b: State) {
  return a.codeThemeId === b.codeThemeId && sameTheme(a.theme, b.theme)
}

export function serializeThemeString(value: SharedTheme) {
  return `${prefix}${JSON.stringify(value)}`
}

export function parseThemeString(value: string) {
  const item = value.trim()
  if (!item.startsWith(prefix)) throw new Error("Theme share string mismatch")
  const body = item.slice(prefix.length)
  const text = body.startsWith("{") ? body : decodeURIComponent(body)
  const json = JSON.parse(text) as Record<string, unknown>
  if (typeof json.codeThemeId !== "string" || json.codeThemeId.length === 0) throw new Error("Theme code theme mismatch")
  if (!isMode(json.variant)) throw new Error("Theme variant mismatch")
  return {
    codeThemeId: json.codeThemeId,
    theme: parseTheme(json.theme, json.variant),
    variant: json.variant,
  } satisfies SharedTheme
}

export function importThemeString(value: string, variant: Mode, items: Item[]) {
  const item = parseThemeString(value)
  if (item.variant !== variant) throw new Error("Theme variant mismatch")
  const code = items.find((entry) => entry.id === item.codeThemeId)
  if (code == null) throw new Error("Theme code theme mismatch")
  return {
    codeThemeId: code.id,
    theme: normalizeThemeSeed(item.theme, variant),
  } satisfies State
}

export function useAppearanceScheme() {
  return useConfig(config.APPEARANCE_THEME, parseScheme, (value) => value)
}

export function useThemeService(variant: Mode): Service {
  const keys = themeKeys(variant)
  const chrome = useConfig<ThemeSeed | undefined>(
    keys.chromeThemeConfigurationKey,
    (value) => parseChrome(value, variant),
    (value) => (value == null ? null : JSON.stringify(value)),
  )
  const code = useConfig<string | undefined>(keys.codeThemeConfigurationKey, parseCode, (value) => value ?? null)

  const theme = useMemo(() => normalizeThemeSeed(chrome.data, variant), [chrome.data, variant])
  const codeThemes = useMemo(() => availableThemes(variant), [variant])
  const selectedCodeTheme = useMemo(() => pickTheme(code.data ?? "", variant), [code.data, variant])
  const init = useMemo(
    () =>
      ({
        codeThemeId: selectedCodeTheme.id,
        theme,
      }) satisfies State,
    [selectedCodeTheme.id, theme],
  )
  const isDisabled = chrome.isLoading || code.isLoading
  const setChromeCache = chrome.setCachedData
  const setCodeCache = code.setCachedData
  const writeChrome = chrome.writeData
  const writeCode = code.writeData
  const live = useRef(init)
  const save = useRef(init)
  const depth = useRef(0)
  const queue = useRef(Promise.resolve())

  if (depth.current === 0) {
    live.current = init
    save.current = init
  }

  const cache = useCallback(
    (value: State) => {
      live.current = value
      setChromeCache(value.theme)
      setCodeCache(value.codeThemeId)
    },
    [setChromeCache, setCodeCache],
  )

  const run = useCallback(
    async (value: State, task: () => Promise<void>) => {
      depth.current += 1
      cache(value)
      const next = async () => {
        try {
          await task()
        } catch (err) {
          if (sameState(live.current, value)) cache(save.current)
          throw err
        } finally {
          depth.current -= 1
        }
      }
      const out = queue.current.then(next, next)
      queue.current = out.catch(() => undefined)
      await out
    },
    [cache],
  )

  const write = useCallback(
    async (value: State) => {
      await run(value, async () => {
        const prev = save.current
        await writeChrome(value.theme)
        try {
          await writeCode(value.codeThemeId)
        } catch (err) {
          await writeChrome(prev.theme).catch(() => undefined)
          throw err
        }
        save.current = value
      })
    },
    [run, writeChrome, writeCode],
  )

  const setTheme = useCallback(
    async (theme: ThemeSeed) => {
      if (isDisabled) return
      const value = { ...live.current, theme } satisfies State
      await run(value, async () => {
        const prev = save.current
        if (prev.codeThemeId !== value.codeThemeId) {
          await writeCode(value.codeThemeId)
          try {
            await writeChrome(theme)
          } catch (err) {
            await writeCode(prev.codeThemeId).catch(() => undefined)
            throw err
          }
          save.current = value
          return
        }
        await writeChrome(theme)
        save.current = value
      })
    },
    [isDisabled, run, writeChrome, writeCode],
  )

  const setThemePatch = useCallback(
    (patch: Patch | ThemePatch) => {
      setTheme(mergeTheme(live.current.theme, patch)).catch(() => undefined)
    },
    [setTheme],
  )

  const setFontsPatch = useCallback(
    (patch: Partial<ThemeSeed["fonts"]>) => {
      setTheme(mergeTheme(live.current.theme, { fonts: patch } as Patch)).catch(() => undefined)
    },
    [setTheme],
  )

  const setCodeThemeId = useCallback(
    async (id: string) => {
      if (isDisabled) return
      const patch = await loadThemeSeed(id, variant)
      await write({
        codeThemeId: id,
        theme: mergeTheme(live.current.theme, patch),
      })
    },
    [isDisabled, variant, write],
  )

  const exportThemeString = useCallback(
    () =>
      serializeThemeString({
        codeThemeId: live.current.codeThemeId,
        theme: live.current.theme,
        variant,
      }),
    [variant],
  )

  const canImportThemeString = useCallback(
    (value: string) => {
      try {
        importThemeString(value, variant, codeThemes)
        return true
      } catch {
        return false
      }
    },
    [codeThemes, variant],
  )

  const load = useCallback(
    async (value: string) => {
      if (isDisabled) return
      await write(importThemeString(value, variant, codeThemes))
    },
    [codeThemes, isDisabled, variant, write],
  )

  return useMemo(
    () => ({
      canImportThemeString,
      codeThemes,
      exportThemeString,
      fonts: theme.fonts,
      importThemeString: load,
      isDisabled,
      selectedCodeTheme,
      setCodeThemeId,
      setFontsPatch,
      setThemePatch,
      theme,
    }),
    [canImportThemeString, codeThemes, exportThemeString, isDisabled, load, selectedCodeTheme, setCodeThemeId, setFontsPatch, setThemePatch, theme],
  )
}
