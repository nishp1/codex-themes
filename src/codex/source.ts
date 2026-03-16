export type Mode = "light" | "dark"

export type Tone = {
  scope?: string | string[]
  settings?: {
    foreground?: string
  }
}

export type RawTheme = {
  bg?: string
  chromeTheme?: Partial<ThemeSeed>
  colors?: Record<string, string>
  displayName?: string
  fg?: string
  name: string
  semanticTokenColors?: Record<string, string | { foreground?: string }>
  settings?: Tone[]
  tokenColors?: Tone[]
  type?: string
}

export type ThemeSeed = {
  accent: string
  contrast: number
  fonts: {
    code: string | null
    ui: string | null
  }
  ink: string
  opaqueWindows: boolean
  semanticColors: {
    diffAdded: string
    diffRemoved: string
    skill: string
  }
  surface: string
}

export type Variant = {
  load: () => Promise<RawTheme>
  loadChromeThemeSeed: () => Promise<ThemePatch>
  name: string
}

export type Item = {
  id: string
  label: string
  registrationByVariant: Partial<Record<Mode, Variant>>
}

export type ThemePatch = Partial<ThemeSeed> &
  Pick<
    ThemeSeed,
    | "accent"
    | "ink"
    | "semanticColors"
    | "surface"
  >

type Range = {
  max: number
  min: number
}

type Color = {
  alpha: number
  blue: number
  green: number
  red: number
}

type ThemeCtx = {
  accent: Rgb
  contrast: number
  editorBackground: Rgb
  ink: Rgb
  surface: Rgb
  surfaceUnder: string
  theme: ThemeSeed
  variant: Mode
}

type Rgb = {
  blue: number
  green: number
  red: number
}

const mods = import.meta.glob<{ default: RawTheme }>("./raw/*.js")

const base = {
  dark: {
    accent: "#339cff",
    contrast: 60,
    fonts: { code: null, ui: null },
    ink: "#ffffff",
    opaqueWindows: false,
    semanticColors: { diffAdded: "#40c977", diffRemoved: "#fa423e", skill: "#ad7bf9" },
    surface: "#181818",
  },
  light: {
    accent: "#0285ff",
    contrast: 45,
    fonts: { code: null, ui: null },
    ink: "#0d0d0d",
    opaqueWindows: false,
    semanticColors: { diffAdded: "#00a240", diffRemoved: "#ba2623", skill: "#924ff7" },
    surface: "#ffffff",
  },
} as const

const black = { blue: 0, green: 0, red: 0 }
const white = { blue: 255, green: 255, red: 255 }
const anchor = { dark: base.dark.contrast, light: base.light.contrast }
const gain = 0.7
const lift = 2
const shadow = { dark: 0.16, light: 0.04 }
const sink = { dark: 0.0015, light: 0.0012 }
const panel = { dark: 0.03, light: 0.18 }
const haze = { dark: 0.03, light: 0.008 }
const fillMin = 0.45
const popMin = 24
const addRange: Range = { max: 170, min: 80 }
const addHue = 125
const delRange: Range = { max: 15, min: 345 }
const delHue = 0
const skillRange: Range = { max: 320, min: 210 }
const skillHue = 265
const collator = new Intl.Collator(undefined, { sensitivity: "base" })
const fallback = "codex"

const bgKeys = [
  "editor.background",
  "sideBar.background",
  "editorGroupHeader.tabsBackground",
  "panel.background",
  "activityBar.background",
]

const inkKeys = ["editor.foreground", "sideBarTitle.foreground", "sideBar.foreground", "foreground"]

const accentKeys = [
  "activityBarBadge.background",
  "textLink.foreground",
  "editorCursor.foreground",
  "focusBorder",
  "button.background",
  "activityBar.activeBorder",
]

const addKeys = [
  "gitDecoration.addedResourceForeground",
  "gitDecoration.untrackedResourceForeground",
  "terminal.ansiGreen",
  "terminal.ansiBrightGreen",
]

const delKeys = ["gitDecoration.deletedResourceForeground", "terminal.ansiRed", "terminal.ansiBrightRed"]

const skillKeys = ["charts.purple", "terminal.ansiMagenta", "terminal.ansiBrightMagenta"]

function raw(file: string) {
  const key = `./raw/${file}`
  const mod = mods[key]
  if (!mod) throw new Error(`Missing raw theme module: ${key}`)
  return mod().then((mod) => mod.default)
}

function slot(name: string, mode: Mode, load: () => Promise<RawTheme>): Variant {
  let cache: Promise<RawTheme> | null = null
  const read = async () => (cache ??= load())
  return {
    load: read,
    loadChromeThemeSeed: () => read().then((theme) => mergeThemeSeed(resolveThemeSeed(theme, mode), theme.chromeTheme)),
    name,
  }
}

function entry(id: string, label: string, variants: Partial<Record<Mode, { file: string; name: string }>>) {
  const out: Item["registrationByVariant"] = {}
  if (variants.dark) out.dark = slot(variants.dark.name, "dark", () => raw(variants.dark!.file))
  if (variants.light) out.light = slot(variants.light.name, "light", () => raw(variants.light!.file))
  return { id, label, registrationByVariant: out } satisfies Item
}

const list = [
  entry("ayu", "Ayu", { dark: { file: "ayu-dark-DeoI9BGU.js", name: "Ayu Dark" } }),
  entry("catppuccin", "Catppuccin", {
    dark: { file: "catppuccin-mocha-Ry8aD-5u.js", name: "Catppuccin Mocha" },
    light: { file: "catppuccin-latte-Bd1wq-gC.js", name: "Catppuccin Latte" },
  }),
  entry("absolutely", "Absolutely", {
    dark: { file: "absolutely-dark-Zl820baI.js", name: "Absolutely Dark" },
    light: { file: "absolutely-light-C6b2RFMx.js", name: "Absolutely Light" },
  }),
  entry("codex", "Codex", {
    dark: { file: "codex-dark-Br6nfceT.js", name: "Codex Dark" },
    light: { file: "codex-light-pdN2IJ9S.js", name: "Codex Light" },
  }),
  entry("dracula", "Dracula", { dark: { file: "dracula-D9Il0_zR.js", name: "dracula" } }),
  entry("everforest", "Everforest", {
    dark: { file: "everforest-dark-Cj8fMfjQ.js", name: "everforest-dark" },
    light: { file: "everforest-light-B_wG5yZi.js", name: "everforest-light" },
  }),
  entry("github", "GitHub", {
    dark: { file: "github-dark-default-DWyfTly1.js", name: "github-dark-default" },
    light: { file: "github-light-default-CIhlemFQ.js", name: "github-light-default" },
  }),
  entry("gruvbox", "Gruvbox", {
    dark: { file: "gruvbox-dark-medium-ci87zucd.js", name: "gruvbox-dark-medium" },
    light: { file: "gruvbox-light-medium-CyPozz0g.js", name: "gruvbox-light-medium" },
  }),
  entry("linear", "Linear", {
    dark: { file: "linear-dark-0f3KBJw5.js", name: "Linear Dark" },
    light: { file: "linear-light-BuTxgnpC.js", name: "Linear Light" },
  }),
  entry("lobster", "Lobster", { dark: { file: "lobster-dark-dxSKfHK-.js", name: "Lobster Dark" } }),
  entry("material", "Material", { dark: { file: "material-theme-darker-D-xFZPe6.js", name: "material-theme-darker" } }),
  entry("matrix", "Matrix", { dark: { file: "matrix-dark-CnDvzfwM.js", name: "Matrix Dark" } }),
  entry("monokai", "Monokai", { dark: { file: "monokai-C5zO3RFM.js", name: "monokai" } }),
  entry("night-owl", "Night Owl", { dark: { file: "night-owl-DnK0oU3N.js", name: "night-owl" } }),
  entry("nord", "Nord", { dark: { file: "nord-DEoO_SK5.js", name: "nord" } }),
  entry("notion", "Notion", {
    dark: { file: "notion-dark-BTRKJ-yg.js", name: "Notion Dark" },
    light: { file: "notion-light-CtgtIlWb.js", name: "Notion Light" },
  }),
  entry("oscurange", "Oscurange", { dark: { file: "oscurange-C-9zjgEq.js", name: "Oscurange" } }),
  entry("one", "One", {
    dark: { file: "one-dark-pro-D-HQrStr.js", name: "one-dark-pro" },
    light: { file: "one-light-CJA2ZR8h.js", name: "one-light" },
  }),
  entry("proof", "Proof", { light: { file: "proof-light-B7vsCcYh.js", name: "Proof Light" } }),
  entry("rose-pine", "Rose Pine", {
    dark: { file: "rose-pine-moon-BttsuGa9.js", name: "rose-pine-moon" },
    light: { file: "rose-pine-dawn-koa58u7m.js", name: "rose-pine-dawn" },
  }),
  entry("sentry", "Sentry", { dark: { file: "sentry-dark-QRQbAa_B.js", name: "Sentry Dark" } }),
  entry("solarized", "Solarized", {
    dark: { file: "solarized-dark-B0lR0uIV.js", name: "solarized-dark" },
    light: { file: "solarized-light-CvAm3SjJ.js", name: "solarized-light" },
  }),
  entry("tokyo-night", "Tokyo Night", { dark: { file: "tokyo-night-xCIIK3YY.js", name: "tokyo-night" } }),
  entry("temple", "Temple", { dark: { file: "temple-dark-1ouW2SxA.js", name: "Temple Dark" } }),
  entry("vscode-plus", "VS Code Plus", {
    dark: { file: "dark-plus-B1yOZ-Hy.js", name: "dark-plus" },
    light: { file: "light-plus-DBeuRQRE.js", name: "light-plus" },
  }),
] as const satisfies readonly Item[]

const ids = list.map((item) => item.id)

export const items = list.map((item) => ({ ...item, registrationByVariant: { ...item.registrationByVariant } }))

export function allVariants() {
  return list.flatMap((item) => Object.values(item.registrationByVariant)).filter((item) => item != null)
}

export function hasTheme(id: string) {
  return ids.some((item) => item === id)
}

export function availableThemes(mode?: Mode) {
  return list
    .filter((item) => (mode == null ? true : item.registrationByVariant[mode] != null))
    .slice()
    .sort((a, b) => collator.compare(a.label, b.label))
}

export function pickTheme(id: string, mode: Mode) {
  const list = availableThemes(mode)
  return list.find((item) => item.id === id) ?? list.find((item) => item.id === fallback) ?? list[0] ?? items[0]
}

export function variant(item: string | Item, mode: Mode) {
  const id = typeof item === "string" ? item : item.id
  const reg = pickTheme(id, mode).registrationByVariant[mode]
  if (reg == null) throw new Error(`Missing ${mode} code theme registration`)
  return reg
}

export async function loadRawTheme(item: string | Item, mode: Mode) {
  return variant(item, mode).load()
}

export async function loadThemeSeed(item: string | Item, mode: Mode) {
  return variant(item, mode).loadChromeThemeSeed()
}

export function normalizeThemeSeed(seed: Partial<ThemeSeed> | undefined, mode: Mode): ThemeSeed {
  const ref = base[mode]
  return {
    accent: cleanHex(seed?.accent) ?? ref.accent,
    contrast: clamp(seed?.contrast, ref.contrast),
    fonts: cleanFonts(seed?.fonts),
    ink: cleanHex(seed?.ink) ?? ref.ink,
    opaqueWindows: seed?.opaqueWindows ?? ref.opaqueWindows,
    semanticColors: cleanSemantics(seed?.semanticColors, ref.semanticColors),
    surface: cleanHex(seed?.surface) ?? ref.surface,
  }
}

export function resolveChromeThemeVariables(seed: ThemeSeed, mode: Mode) {
  const ctx = ctxOf(seed, mode)
  return toVars(ctx, mode === "light" ? light(ctx) : dark(ctx))
}

export function resolveThemeSeed(raw: RawTheme, mode: Mode): ThemePatch {
  const ref = base[mode]
  const surface = firstColor(raw.colors, bgKeys) ?? ref.surface
  const ink = firstColor(raw.colors, inkKeys) ?? ref.ink
  const accent = inferAccent(raw, surface, ink) ?? ref.accent
  return {
    accent,
    ink,
    semanticColors: {
      diffAdded: firstColor(raw.colors, addKeys) ?? inferHue(raw, surface, ink, addRange, addHue) ?? ref.semanticColors.diffAdded,
      diffRemoved: firstColor(raw.colors, delKeys) ?? inferHue(raw, surface, ink, delRange, delHue) ?? ref.semanticColors.diffRemoved,
      skill:
        firstColor(raw.colors, skillKeys) ??
        inferHue(raw, surface, ink, skillRange, skillHue) ??
        (!near(accent, surface) && !near(accent, ink) ? accent : ref.semanticColors.skill),
    },
    surface,
  }
}

export function mergeThemeSeed(seed: ThemePatch, chrome?: Partial<ThemeSeed>) {
  if (chrome == null) return seed
  return {
    ...seed,
    ...chrome,
    fonts: chrome.fonts == null ? seed.fonts : { ...seed.fonts, ...chrome.fonts },
    semanticColors: chrome.semanticColors == null ? seed.semanticColors : { ...seed.semanticColors, ...chrome.semanticColors },
  }
}

function cleanFonts(fonts: Partial<ThemeSeed["fonts"]> | undefined) {
  return {
    code: cleanFont(fonts?.code),
    ui: cleanFont(fonts?.ui),
  }
}

function cleanSemantics(colors: Partial<ThemeSeed["semanticColors"]> | undefined, fallback: ThemeSeed["semanticColors"]) {
  return {
    diffAdded: cleanHex(colors?.diffAdded) ?? fallback.diffAdded,
    diffRemoved: cleanHex(colors?.diffRemoved) ?? fallback.diffRemoved,
    skill: cleanHex(colors?.skill) ?? fallback.skill,
  }
}

function cleanFont(value: string | null | undefined) {
  const item = value?.trim() ?? ""
  return item.length > 0 ? item : null
}

function clamp(value: number | undefined, fallback: number) {
  if (value == null || Number.isNaN(value)) return fallback
  return Math.min(100, Math.max(0, Math.round(value)))
}

function ctxOf(theme: ThemeSeed, mode: Mode): ThemeCtx {
  const contrast = contrastOf(theme.contrast, mode)
  const surface = toRgb(theme.surface)
  const ink = toRgb(theme.ink)
  return {
    accent: toRgb(theme.accent),
    contrast,
    editorBackground: mode === "light" ? mix(surface, white, 0.12) : mix(surface, ink, 0.07),
    ink,
    surface,
    surfaceUnder: under(theme, surface, ink, mode),
    theme,
    variant: mode,
  }
}

function toVars(ctx: ThemeCtx, colors: ReturnType<typeof light> | ReturnType<typeof dark>) {
  return {
    "--codex-base-accent": ctx.theme.accent,
    "--codex-base-contrast": String(ctx.theme.contrast),
    "--codex-base-ink": ctx.theme.ink,
    "--codex-base-surface": ctx.theme.surface,
    "--color-accent-blue": ctx.theme.accent,
    "--color-accent-purple": ctx.theme.semanticColors.skill,
    "--color-background-accent": colors.accentBackground,
    "--color-background-accent-active": colors.accentBackgroundActive,
    "--color-background-accent-hover": colors.accentBackgroundHover,
    "--color-background-button-primary": colors.buttonPrimaryBackground,
    "--color-background-button-primary-active": colors.buttonPrimaryBackgroundActive,
    "--color-background-button-primary-hover": colors.buttonPrimaryBackgroundHover,
    "--color-background-button-primary-inactive": colors.buttonPrimaryBackgroundInactive,
    "--color-background-button-secondary": colors.buttonSecondaryBackground,
    "--color-background-button-secondary-active": colors.buttonSecondaryBackgroundActive,
    "--color-background-button-secondary-hover": colors.buttonSecondaryBackgroundHover,
    "--color-background-button-secondary-inactive": colors.buttonSecondaryBackgroundInactive,
    "--color-background-button-tertiary": colors.buttonTertiaryBackground,
    "--color-background-button-tertiary-active": colors.buttonTertiaryBackgroundActive,
    "--color-background-button-tertiary-hover": colors.buttonTertiaryBackgroundHover,
    "--color-background-control": colors.controlBackground,
    "--color-background-control-opaque": colors.controlBackgroundOpaque,
    "--color-background-editor-opaque": rgb(ctx.editorBackground),
    "--color-background-elevated-primary": colors.elevatedPrimary,
    "--color-background-elevated-primary-opaque": colors.elevatedPrimaryOpaque,
    "--color-background-elevated-secondary": colors.elevatedSecondary,
    "--color-background-elevated-secondary-opaque": colors.elevatedSecondaryOpaque,
    "--color-background-panel": panelOf(ctx),
    "--color-background-surface": ctx.theme.surface,
    "--color-background-surface-under": ctx.surfaceUnder,
    "--color-border": colors.border,
    "--color-border-focus": colors.borderFocus,
    "--color-border-heavy": colors.borderHeavy,
    "--color-border-light": colors.borderLight,
    "--color-decoration-added": ctx.theme.semanticColors.diffAdded,
    "--color-decoration-deleted": ctx.theme.semanticColors.diffRemoved,
    "--color-editor-added": rgba(toRgb(ctx.theme.semanticColors.diffAdded), ctx.variant === "light" ? 0.15 : 0.23),
    "--color-editor-deleted": rgba(toRgb(ctx.theme.semanticColors.diffRemoved), ctx.variant === "light" ? 0.15 : 0.23),
    "--color-icon-accent": colors.iconAccent,
    "--color-icon-primary": colors.iconPrimary,
    "--color-icon-secondary": colors.iconSecondary,
    "--color-icon-tertiary": colors.iconTertiary,
    "--color-simple-scrim": colors.simpleScrim,
    "--color-text-accent": colors.textAccent,
    "--color-text-button-primary": colors.textButtonPrimary,
    "--color-text-button-secondary": colors.textButtonSecondary,
    "--color-text-button-tertiary": colors.textButtonTertiary,
    "--color-text-foreground": colors.textForeground,
    "--color-text-foreground-secondary": colors.textForegroundSecondary,
    "--color-text-foreground-tertiary": colors.textForegroundTertiary,
  }
}

function light(ctx: ThemeCtx) {
  const tone = mix(ctx.surface, white, 0.09 + ctx.contrast * 0.04)
  const rise = mix(ctx.surface, white, 0.08 + ctx.contrast * 0.08)
  const lift = mix(ctx.surface, white, 0.16 + ctx.contrast * 0.12)
  return {
    accentBackground: mixHex(ctx.surface, ctx.accent, 0.11 + ctx.contrast * 0.04),
    accentBackgroundActive: mixHex(ctx.surface, ctx.accent, 0.13 + ctx.contrast * 0.05),
    accentBackgroundHover: mixHex(ctx.surface, ctx.accent, 0.12 + ctx.contrast * 0.045),
    border: rgba(ctx.ink, 0.06 + ctx.contrast * 0.04),
    borderFocus: ctx.theme.accent,
    borderHeavy: rgba(ctx.ink, 0.09 + ctx.contrast * 0.06),
    borderLight: rgba(ctx.ink, 0.04 + ctx.contrast * 0.02),
    buttonPrimaryBackground: ctx.theme.ink,
    buttonPrimaryBackgroundActive: rgba(ctx.ink, 0.1 + ctx.contrast * 0.12),
    buttonPrimaryBackgroundHover: rgba(ctx.ink, 0.05 + ctx.contrast * 0.06),
    buttonPrimaryBackgroundInactive: rgba(ctx.ink, 0.18 + ctx.contrast * 0.14),
    buttonSecondaryBackground: rgba(ctx.ink, 0.04 + ctx.contrast * 0.02),
    buttonSecondaryBackgroundActive: rgba(ctx.ink, 0.03 + ctx.contrast * 0.02),
    buttonSecondaryBackgroundHover: rgba(ctx.ink, 0.05 + ctx.contrast * 0.04),
    buttonSecondaryBackgroundInactive: rgba(ctx.ink, 0.01 + ctx.contrast * 0.02),
    buttonTertiaryBackground: rgba(ctx.ink, 0),
    buttonTertiaryBackgroundActive: rgba(ctx.ink, 0.16 + ctx.contrast * 0.08),
    buttonTertiaryBackgroundHover: rgba(ctx.ink, 0.08 + ctx.contrast * 0.04),
    controlBackground: rgba(tone, 0.96),
    controlBackgroundOpaque: rgb(tone),
    elevatedPrimary: rgba(lift, 0.96),
    elevatedPrimaryOpaque: rgb(lift),
    elevatedSecondary: rgba(rise, 0.96),
    elevatedSecondaryOpaque: rgb(rise),
    iconAccent: ctx.theme.accent,
    iconPrimary: ctx.theme.ink,
    iconSecondary: rgba(ctx.ink, 0.65 + ctx.contrast * 0.1),
    iconTertiary: rgba(ctx.ink, 0.45 + ctx.contrast * 0.1),
    simpleScrim: rgba(black, 0.08 + ctx.contrast * 0.04),
    textAccent: ctx.theme.accent,
    textButtonPrimary: ctx.theme.surface,
    textButtonSecondary: ctx.theme.ink,
    textButtonTertiary: rgba(ctx.ink, 0.45 + ctx.contrast * 0.1),
    textForeground: ctx.theme.ink,
    textForegroundSecondary: rgba(ctx.ink, 0.65 + ctx.contrast * 0.1),
    textForegroundTertiary: rgba(ctx.ink, 0.45 + ctx.contrast * 0.1),
  }
}

function dark(ctx: ThemeCtx) {
  const tone = mix(ctx.surface, ctx.ink, 0.06 + ctx.contrast * 0.05)
  const ring = mix(ctx.accent, white, 0.3 + ctx.contrast * 0.15)
  const fill = mix(ctx.surface, black, 0.38 + ctx.contrast * 0.12)
  const lift = mix(ctx.surface, ctx.ink, 0.08 + ctx.contrast * 0.08)
  return {
    accentBackground: mixHex(black, ctx.accent, 0.2 + ctx.contrast * 0.08),
    accentBackgroundActive: mixHex(black, ctx.accent, 0.22 + ctx.contrast * 0.12),
    accentBackgroundHover: mixHex(black, ctx.accent, 0.21 + ctx.contrast * 0.1),
    border: rgba(ctx.ink, 0.06 + ctx.contrast * 0.04),
    borderFocus: rgba(ring, 0.7 + ctx.contrast * 0.1),
    borderHeavy: rgba(ctx.ink, 0.12 + ctx.contrast * 0.06),
    borderLight: rgba(ctx.ink, 0.03 + ctx.contrast * 0.02),
    buttonPrimaryBackground: rgb(fill),
    buttonPrimaryBackgroundActive: rgba(ctx.ink, 0.07 + ctx.contrast * 0.05),
    buttonPrimaryBackgroundHover: rgba(ctx.ink, 0.04 + ctx.contrast * 0.03),
    buttonPrimaryBackgroundInactive: rgba(ctx.ink, 0.02 + ctx.contrast * 0.02),
    buttonSecondaryBackground: rgba(ctx.ink, 0.04 + ctx.contrast * 0.02),
    buttonSecondaryBackgroundActive: rgba(ctx.ink, 0.09 + ctx.contrast * 0.05),
    buttonSecondaryBackgroundHover: rgba(ctx.ink, 0.06 + ctx.contrast * 0.03),
    buttonSecondaryBackgroundInactive: rgba(ctx.ink, 0.02 + ctx.contrast * 0.03),
    buttonTertiaryBackground: rgba(ctx.ink, 0.02 + ctx.contrast * 0.015),
    buttonTertiaryBackgroundActive: rgba(ctx.ink, 0.07 + ctx.contrast * 0.05),
    buttonTertiaryBackgroundHover: rgba(ctx.ink, 0.05 + ctx.contrast * 0.03),
    controlBackground: rgba(tone, 0.96),
    controlBackgroundOpaque: rgb(tone),
    elevatedPrimary: rgba(lift, 0.96),
    elevatedPrimaryOpaque: rgb(lift),
    elevatedSecondary: rgba(ctx.ink, 0.02 + ctx.contrast * 0.02),
    elevatedSecondaryOpaque: mixHex(ctx.surface, ctx.theme.ink, 0.04 + ctx.contrast * 0.05),
    iconAccent: rgb(ring),
    iconPrimary: rgba(ctx.ink, 0.82 + ctx.contrast * 0.14),
    iconSecondary: rgba(ctx.ink, 0.65 + ctx.contrast * 0.1),
    iconTertiary: rgba(ctx.ink, 0.45 + ctx.contrast * 0.1),
    simpleScrim: rgba(ctx.ink, 0.08 + ctx.contrast * 0.04),
    textAccent: rgb(ring),
    textButtonPrimary: rgb(fill),
    textButtonSecondary: mixHex(ctx.theme.ink, ctx.theme.surface, 0.7 + ctx.contrast * 0.1),
    textButtonTertiary: rgba(ctx.ink, 0.45 + ctx.contrast * 0.1),
    textForeground: ctx.theme.ink,
    textForegroundSecondary: rgba(ctx.ink, 0.65 + ctx.contrast * 0.1),
    textForegroundTertiary: rgba(ctx.ink, 0.42 + ctx.contrast * 0.13),
  }
}

function cleanHex(value: string | undefined) {
  if (value == null) return
  const item = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(item)) return item.toLowerCase()
}

function contrastOf(value: number, mode: Mode) {
  const base = anchor[mode]
  const low = base / 100
  const high = value / 100 + ((value - base) / 60) * gain
  if (value <= base) return high
  return low + (high - low) * lift
}

function under(theme: ThemeSeed, surface: Rgb, ink: Rgb, mode: Mode) {
  const base = anchor[mode]
  const alpha = shadow[mode] + (theme.contrast - base) * sink[mode]
  return mode === "light" ? mixHex(surface, ink, alpha) : mixHex(surface, black, alpha)
}

function panelOf(ctx: ThemeCtx) {
  const fill = ctx.variant === "light" ? white : ctx.ink
  return mixHex(ctx.surface, fill, panel[ctx.variant] + ctx.contrast * haze[ctx.variant])
}

function toRgb(value: string) {
  const item = value.slice(1)
  return {
    blue: Number.parseInt(item.slice(4, 6), 16),
    green: Number.parseInt(item.slice(2, 4), 16),
    red: Number.parseInt(item.slice(0, 2), 16),
  }
}

function rgb(value: Rgb) {
  return `rgb(${value.red}, ${value.green}, ${value.blue})`
}

function rgba(value: Rgb, alpha: number) {
  return `rgba(${value.red}, ${value.green}, ${value.blue}, ${trim(alpha)})`
}

function mixHex(a: Rgb | string, b: Rgb | string, value: number) {
  return hex(mix(typeof a === "string" ? toRgb(a) : a, typeof b === "string" ? toRgb(b) : b, value))
}

function mix(a: Rgb, b: Rgb, value: number) {
  const alpha = Math.min(1, Math.max(0, value))
  return {
    blue: unit(a.blue, b.blue, alpha),
    green: unit(a.green, b.green, alpha),
    red: unit(a.red, b.red, alpha),
  }
}

function unit(a: number, b: number, value: number) {
  return Math.round(a + (b - a) * value)
}

function trim(value: number) {
  return Math.min(1, Math.max(0, value)).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
}

function hex(value: Rgb) {
  return `#${pad(value.red)}${pad(value.green)}${pad(value.blue)}`
}

function pad(value: number) {
  return value.toString(16).padStart(2, "0")
}

function firstColor(colors: RawTheme["colors"], keys: string[]) {
  if (colors != null) {
    for (const key of keys) {
      const value = cleanColor(colors[key])
      if (value != null) return value
    }
  }
}

function inferAccent(raw: RawTheme, surface: string, ink: string) {
  if (raw.colors != null) {
    for (const key of accentKeys) {
      const value = cleanColor(raw.colors[key], { minimumAlpha: fillMin, minimumChromaticRange: popMin })
      if (value != null && !near(value, surface) && !near(value, ink)) return value
    }
  }
  let out: string | undefined
  let score = -1
  for (const item of tones(raw)) {
    const value = cleanColor(item.settings?.foreground, { minimumAlpha: fillMin, minimumChromaticRange: popMin })
    if (value == null || near(value, surface) || near(value, ink)) continue
    const next = spread(value, surface, ink)
    if (next > score) {
      out = value
      score = next
    }
  }
  return out
}

function inferHue(raw: RawTheme, surface: string, ink: string, range: Range, want: number) {
  let out: string | undefined
  let score = -1
  for (const value of uniqueColors(raw)) {
    if (near(value, surface) || near(value, ink)) continue
    const item = parse(value)
    if (item == null) continue
    const hue = hueOf(item)
    if (hue == null || !inside(hue, range)) continue
    const next = spread(value, surface, ink) - hueGap(hue, want) * 2
    if (next > score) {
      out = value
      score = next
    }
  }
  return out
}

function tones(raw: RawTheme) {
  return [...(raw.tokenColors ?? []), ...(raw.settings ?? [])]
}

function uniqueColors(raw: RawTheme) {
  const list = Object.values(raw.colors ?? {})
  const more = tones(raw).map((item) => item.settings?.foreground)
  const set = new Set<string>()
  for (const item of [...list, ...more]) {
    const value = cleanColor(item, { minimumAlpha: fillMin, minimumChromaticRange: popMin })
    if (value != null) set.add(value)
  }
  return [...set]
}

function cleanColor(value: string | undefined, opts?: { minimumAlpha?: number; minimumChromaticRange?: number }) {
  const item = parse(value)
  if (item == null) return
  const { minimumAlpha = 0.98, minimumChromaticRange = 0 } = opts ?? {}
  if (item.alpha < minimumAlpha || chroma(item) < minimumChromaticRange) return
  return solid(item)
}

function parse(value: string | undefined) {
  if (value == null) return
  const item = value.trim()
  if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(item)) return
  const tail = item.length === 9 ? item.slice(7, 9) : "ff"
  return {
    alpha: Number.parseInt(tail, 16) / 255,
    blue: Number.parseInt(item.slice(5, 7), 16),
    green: Number.parseInt(item.slice(3, 5), 16),
    red: Number.parseInt(item.slice(1, 3), 16),
  } satisfies Color
}

function near(a: string, b: string) {
  const x = parse(a)
  const y = parse(b)
  return x != null && y != null ? gap(x, y) < 42 : false
}

function spread(value: string, surface: string, ink: string) {
  const a = parse(value)
  const b = parse(surface)
  const c = parse(ink)
  if (a == null || b == null || c == null) return 0
  return chroma(a) + gap(a, b) / 4 + gap(a, c) / 4
}

function gap(a: Rgb, b: Rgb) {
  return Math.sqrt((a.red - b.red) ** 2 + (a.green - b.green) ** 2 + (a.blue - b.blue) ** 2)
}

function hueOf(value: Rgb) {
  const red = value.red / 255
  const green = value.green / 255
  const blue = value.blue / 255
  const max = Math.max(red, green, blue)
  const delta = max - Math.min(red, green, blue)
  if (delta === 0) return null
  const hue = max === red ? ((green - blue) / delta) * 60 : max === green ? ((blue - red) / delta + 2) * 60 : ((red - green) / delta + 4) * 60
  return (hue + 360) % 360
}

function inside(value: number, range: Range) {
  return range.min <= range.max ? value >= range.min && value <= range.max : value >= range.min || value <= range.max
}

function hueGap(a: number, b: number) {
  const gap = Math.abs(a - b)
  return Math.min(gap, 360 - gap)
}

function chroma(value: Rgb) {
  return Math.max(value.red, value.green, value.blue) - Math.min(value.red, value.green, value.blue)
}

function solid(value: Rgb) {
  return `#${value.red.toString(16).padStart(2, "0")}${value.green.toString(16).padStart(2, "0")}${value.blue.toString(16).padStart(2, "0")}`
}
