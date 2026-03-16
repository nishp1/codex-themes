import { darken, lighten, mixColors, withAlpha } from "../theme/color"
import type { HexColor } from "../theme/types"
import {
  availableThemes,
  items as sourceItems,
  loadRawTheme,
  loadThemeSeed,
  normalizeThemeSeed,
  pickTheme,
  resolveChromeThemeVariables,
  type Item as ThemeItem,
  type RawTheme as Raw,
  type ThemeSeed as Seed,
  type Tone,
} from "./source"

export type Mode = "light" | "dark"
export type Item = ThemeItem

type ToneVar =
  | "comment"
  | "function"
  | "keyword"
  | "primitive"
  | "punctuation"
  | "string"
  | "type"
  | "variable"

type Match = {
  hit: string
  score: number
  value: string
}

type Pick = {
  keys?: string[]
  names?: string[]
}

type Rgb = {
  blue: number
  green: number
  red: number
}

export type Loaded = {
  item: ThemeItem
  mode: Mode
  name: string
  raw: Raw
  seed: Seed
  vars: Record<string, string>
}

const black = "#000000" as HexColor
const white = "#ffffff" as HexColor
const inkKeys = ["editor.foreground", "sideBarTitle.foreground", "sideBar.foreground", "foreground"]

const anchor = { dark: 60, light: 45 }
const gain = 0.7
const lift = 2

export const items = sourceItems.map((item) => ({ ...item, registrationByVariant: { ...item.registrationByVariant } }))

export function avail(mode: Mode) {
  return availableThemes(mode)
}

export function pick(id: string, mode: Mode) {
  return pickTheme(id, mode)
}

export async function load(item: ThemeItem, mode: Mode) {
  const next = pick(item.id, mode)
  const data = await loadRawTheme(next, mode)
  const seed = normalizeThemeSeed(await loadThemeSeed(next, mode), mode)
  return resolve(next, mode, data, seed)
}

export async function loadWithTheme(item: ThemeItem, mode: Mode, seed: Seed) {
  const next = pick(item.id, mode)
  const data = await loadRawTheme(next, mode)
  return resolve(next, mode, data, seed)
}

function resolve(item: ThemeItem, mode: Mode, raw: Raw, seed: Seed) {
  const vars = {
    ...tone(seed, raw, mode),
    ...resolveChromeThemeVariables(seed, mode),
    ...syntax(raw),
    "--font-code": seed.fonts.code ?? "ui-monospace, SFMono-Regular, Menlo, monospace",
    "--font-ui": seed.fonts.ui ?? "Inter, ui-sans-serif, system-ui, sans-serif",
  }
  return {
    item,
    mode,
    name: raw.displayName ?? raw.name,
    raw,
    seed,
    vars,
  } satisfies Loaded
}

function tone(seed: Seed, raw: Raw, mode: Mode) {
  const syn = syntax(raw)
  const c = level(seed.contrast, mode)
  const surface = seed.surface as HexColor
  const ink = seed.ink as HexColor
  const accent = seed.accent as HexColor
  const skill = seed.semanticColors.skill as HexColor
  const add = seed.semanticColors.diffAdded as HexColor
  const del = seed.semanticColors.diffRemoved as HexColor
  const warn = (first(raw.colors, ["terminal.ansiYellow", "terminal.ansiBrightYellow", "editorWarning.foreground"]) ?? syn["--syntax-primitive"]) as HexColor
  const info = (first(raw.colors, ["terminal.ansiCyan", "terminal.ansiBrightCyan", "editorInfo.foreground"]) ?? syn["--syntax-type"]) as HexColor
  const bg0 = surface
  const bg1 = mixhex(surface, ink, mode === "dark" ? 0.022 + c * 0.035 : 0.018 + c * 0.03)
  const bg2 = mixhex(surface, ink, mode === "dark" ? 0.048 + c * 0.06 : 0.032 + c * 0.05)
  const bg3 = mixhex(surface, ink, mode === "dark" ? 0.078 + c * 0.085 : 0.055 + c * 0.065)
  const side = view(raw.colors, ["sideBar.background", "activityBar.background"]) ?? bg1
  const panel = view(raw.colors, ["dropdown.background", "menu.background", "quickInput.background", "panel.background"]) ?? bg2
  const editorHex = (first(raw.colors, ["editor.background"]) ?? bg1) as HexColor
  const editorBg = view(raw.colors, ["editor.background"]) ?? editorHex
  const editorFg = view(raw.colors, ["editor.foreground"]) ?? ink
  const termHex = (first(raw.colors, ["terminal.background", "editor.background"]) ?? editorHex) as HexColor
  const termBg = view(raw.colors, ["terminal.background", "editor.background"]) ?? termHex
  const termFgHex = (first(raw.colors, ["terminal.foreground", "editor.foreground"]) ?? ink) as HexColor
  const termFg = view(raw.colors, ["terminal.foreground", "editor.foreground"]) ?? termFgHex
  const inputBg = view(raw.colors, ["input.background", "dropdown.background"]) ?? glow(ink, mode === "dark" ? 0.05 + c * 0.02 : 0.045 + c * 0.02)
  const inputBorder = view(raw.colors, ["input.border", "dropdown.border"]) ?? glow(ink, mode === "dark" ? 0.12 + c * 0.04 : 0.16 + c * 0.05)
  const border = view(raw.colors, ["panel.border", "dropdown.border", "editorWidget.border"]) ?? glow(ink, mode === "dark" ? 0.08 + c * 0.05 : 0.11 + c * 0.05)
  const borderLight = glow(ink, mode === "dark" ? 0.04 + c * 0.03 : 0.06 + c * 0.03)
  const borderHeavy = glow(ink, mode === "dark" ? 0.12 + c * 0.06 : 0.16 + c * 0.06)
  const text2 = view(raw.colors, ["descriptionForeground", "sideBar.foreground"]) ?? glow(ink, mode === "dark" ? 0.72 + c * 0.08 : 0.68 + c * 0.08)
  const text3 = view(raw.colors, ["disabledForeground"]) ?? glow(ink, mode === "dark" ? 0.46 + c * 0.08 : 0.4 + c * 0.1)
  const link = (first(raw.colors, ["textLink.foreground", "textLink.activeForeground"]) ?? accent) as HexColor
  const linkActive = (first(raw.colors, ["textLink.activeForeground"]) ?? (mode === "dark" ? up(link, 0.035) : down(link, 0.035))) as HexColor
  const accentBg = view(raw.colors, ["list.activeSelectionBackground", "menubar.selectionBackground"]) ?? glow(accent, mode === "dark" ? 0.22 + c * 0.08 : 0.14 + c * 0.05)
  const accentHover = glow(accent, mode === "dark" ? 0.24 + c * 0.09 : 0.17 + c * 0.06)
  const accentActive = glow(accent, mode === "dark" ? 0.28 + c * 0.11 : 0.2 + c * 0.08)
  const hover = view(raw.colors, ["list.hoverBackground", "toolbar.hoverBackground"]) ?? glow(ink, mode === "dark" ? 0.06 + c * 0.03 : 0.05 + c * 0.04)
  const select = view(raw.colors, ["editor.selectionBackground", "terminal.selectionBackground"]) ?? accentBg
  const badgeBg = (first(raw.colors, ["badge.background", "activityBarBadge.background"]) ?? accent) as HexColor
  const badgeFg = (first(raw.colors, ["badge.foreground", "activityBarBadge.foreground"]) ?? on(badgeBg)) as HexColor
  const button = (first(raw.colors, ["button.background"]) ?? (mode === "dark" ? down(accent, 0.08) : accent)) as HexColor
  const buttonFg = (first(raw.colors, ["button.foreground"]) ?? on(button)) as HexColor
  const buttonHover = view(raw.colors, ["button.hoverBackground"]) ?? (mode === "dark" ? up(button, 0.03) : down(button, 0.03))
  const button2 = view(raw.colors, ["button.secondaryBackground"]) ?? glow(ink, mode === "dark" ? 0.05 + c * 0.02 : 0.045 + c * 0.03)
  const button2Fg = view(raw.colors, ["button.secondaryForeground"]) ?? ink
  const button2Hover = view(raw.colors, ["button.secondaryHoverBackground"]) ?? glow(ink, mode === "dark" ? 0.08 + c * 0.03 : 0.09 + c * 0.03)
  const termBlack = (first(raw.colors, ["terminal.ansiBlack"]) ?? down(termHex, mode === "dark" ? 0.05 : 0.14)) as HexColor
  const termWhite = (first(raw.colors, ["terminal.ansiWhite"]) ?? termFgHex) as HexColor
  const termBlue = (first(raw.colors, ["terminal.ansiBlue"]) ?? accent) as HexColor
  const termCyan = (first(raw.colors, ["terminal.ansiCyan"]) ?? info) as HexColor
  const termGreen = (first(raw.colors, ["terminal.ansiGreen"]) ?? add) as HexColor
  const termMagenta = (first(raw.colors, ["terminal.ansiMagenta"]) ?? skill) as HexColor
  const termRed = (first(raw.colors, ["terminal.ansiRed"]) ?? del) as HexColor
  const termYellow = (first(raw.colors, ["terminal.ansiYellow"]) ?? warn) as HexColor
  const scrim = mode === "dark" ? "rgba(0, 0, 0, 0.32)" : "rgba(15, 23, 42, 0.1)"
  const addBg = view(raw.colors, ["diffEditor.insertedLineBackground", "editorGutter.addedBackground"]) ?? glow(add, mode === "dark" ? 0.2 : 0.14)
  const delBg = view(raw.colors, ["diffEditor.removedLineBackground", "editorGutter.deletedBackground"]) ?? glow(del, mode === "dark" ? 0.2 : 0.14)
  const warnBg = view(raw.colors, ["inputValidation.warningBackground"]) ?? glow(warn, mode === "dark" ? 0.16 : 0.12)
  const warnBorder = view(raw.colors, ["inputValidation.warningBorder"]) ?? glow(warn, mode === "dark" ? 0.5 : 0.46)
  const errBg = view(raw.colors, ["inputValidation.errorBackground"]) ?? glow(del, mode === "dark" ? 0.18 : 0.14)
  const errBorder = view(raw.colors, ["inputValidation.errorBorder"]) ?? glow(del, mode === "dark" ? 0.52 : 0.48)
  const infoBg = view(raw.colors, ["inputValidation.infoBackground"]) ?? addBg
  const fog = glow(ink, mode === "dark" ? 0.06 + c * 0.03 : 0.025 + c * 0.02)

  return {
    "--codex-base-accent": accent,
    "--codex-base-contrast": String(seed.contrast),
    "--codex-base-ink": ink,
    "--codex-base-surface": surface,

    "--vscode-foreground": ink,
    "--vscode-editor-background": editorBg,
    "--vscode-editor-foreground": editorFg,
    "--vscode-editor-selectionBackground": select,
    "--vscode-sideBar-background": side,
    "--vscode-dropdown-background": panel,
    "--vscode-dropdown-border": border,
    "--vscode-dropdown-foreground": ink,
    "--vscode-input-background": inputBg,
    "--vscode-input-border": inputBorder,
    "--vscode-input-foreground": ink,
    "--vscode-input-placeholderForeground": text3,
    "--vscode-button-background": button,
    "--vscode-button-foreground": buttonFg,
    "--vscode-button-hoverBackground": buttonHover,
    "--vscode-button-secondaryBackground": button2,
    "--vscode-button-secondaryForeground": button2Fg,
    "--vscode-button-secondaryHoverBackground": button2Hover,
    "--vscode-badge-background": badgeBg,
    "--vscode-badge-foreground": badgeFg,
    "--vscode-focusBorder": accent,
    "--vscode-textLink-foreground": link,
    "--vscode-textLink-activeForeground": linkActive,
    "--vscode-terminal-background": termBg,
    "--vscode-terminal-foreground": termFg,
    "--vscode-terminal-selectionBackground": select,
    "--vscode-terminal-ansiBlack": termBlack,
    "--vscode-terminal-ansiBlue": termBlue,
    "--vscode-terminal-ansiBrightBlack": (first(raw.colors, ["terminal.ansiBrightBlack"]) ?? up(termBlack, 0.12)) as HexColor,
    "--vscode-terminal-ansiBrightBlue": (first(raw.colors, ["terminal.ansiBrightBlue"]) ?? up(termBlue, 0.08)) as HexColor,
    "--vscode-terminal-ansiBrightCyan": (first(raw.colors, ["terminal.ansiBrightCyan"]) ?? up(termCyan, 0.08)) as HexColor,
    "--vscode-terminal-ansiBrightGreen": (first(raw.colors, ["terminal.ansiBrightGreen"]) ?? up(termGreen, 0.08)) as HexColor,
    "--vscode-terminal-ansiBrightMagenta": (first(raw.colors, ["terminal.ansiBrightMagenta"]) ?? up(termMagenta, 0.08)) as HexColor,
    "--vscode-terminal-ansiBrightRed": (first(raw.colors, ["terminal.ansiBrightRed"]) ?? up(termRed, 0.08)) as HexColor,
    "--vscode-terminal-ansiBrightWhite": (first(raw.colors, ["terminal.ansiBrightWhite"]) ?? up(termWhite, 0.02)) as HexColor,
    "--vscode-terminal-ansiBrightYellow": (first(raw.colors, ["terminal.ansiBrightYellow"]) ?? up(termYellow, 0.08)) as HexColor,
    "--vscode-terminal-ansiCyan": termCyan,
    "--vscode-terminal-ansiGreen": termGreen,
    "--vscode-terminal-ansiMagenta": termMagenta,
    "--vscode-terminal-ansiRed": termRed,
    "--vscode-terminal-ansiWhite": termWhite,
    "--vscode-terminal-ansiYellow": termYellow,

    "--color-token-main-surface-primary": bg0,
    "--color-token-bg-primary": bg0,
    "--color-token-bg-secondary": bg1,
    "--color-token-bg-tertiary": bg2,
    "--color-token-bg-fog": fog,
    "--color-token-border": border,
    "--color-token-border-default": border,
    "--color-token-border-light": borderLight,
    "--color-token-dropdown-background": panel,
    "--color-token-editor-background": editorBg,
    "--color-token-editor-foreground": editorFg,
    "--color-token-editor-error-foreground": del,
    "--color-token-editor-group-drop-background": glow(accent, mode === "dark" ? 0.16 : 0.12),
    "--color-token-editor-group-drop-into-prompt-background": accentBg,
    "--color-token-editor-group-drop-into-prompt-foreground": ink,
    "--color-token-editor-warning-foreground": warn,
    "--color-token-error-foreground": del,
    "--color-token-focus-border": accent,
    "--color-token-foreground": ink,
    "--color-token-git-decoration-added-resource-foreground": add,
    "--color-token-git-decoration-deleted-resource-foreground": del,
    "--color-token-icon-foreground": text2,
    "--color-token-input-background": inputBg,
    "--color-token-input-border": inputBorder,
    "--color-token-input-foreground": ink,
    "--color-token-input-placeholder-foreground": text3,
    "--color-token-input-validation-error-background": errBg,
    "--color-token-input-validation-error-border": errBorder,
    "--color-token-input-validation-info-background": infoBg,
    "--color-token-input-validation-warning-background": warnBg,
    "--color-token-input-validation-warning-border": warnBorder,
    "--color-token-link": link,
    "--color-token-list-active-selection-background": accentBg,
    "--color-token-list-hover-background": hover,
    "--color-token-menu-background": panel,
    "--color-token-menu-border": border,
    "--color-token-menubar-selection-background": accentBg,
    "--color-token-menubar-selection-foreground": ink,
    "--color-token-radio-active-foreground": accent,
    "--color-token-scrollbar-slider-active-background": glow(ink, mode === "dark" ? 0.3 : 0.24),
    "--color-token-scrollbar-slider-background": glow(ink, mode === "dark" ? 0.2 : 0.14),
    "--color-token-scrollbar-slider-hover-background": glow(ink, mode === "dark" ? 0.24 : 0.18),
    "--color-token-side-bar-background": side,
    "--color-token-terminal-ansi-black": termBlack,
    "--color-token-terminal-ansi-blue": termBlue,
    "--color-token-terminal-ansi-bright-black": "var(--vscode-terminal-ansiBrightBlack)",
    "--color-token-terminal-ansi-bright-blue": "var(--vscode-terminal-ansiBrightBlue)",
    "--color-token-terminal-ansi-bright-cyan": "var(--vscode-terminal-ansiBrightCyan)",
    "--color-token-terminal-ansi-bright-green": "var(--vscode-terminal-ansiBrightGreen)",
    "--color-token-terminal-ansi-bright-magenta": "var(--vscode-terminal-ansiBrightMagenta)",
    "--color-token-terminal-ansi-bright-red": "var(--vscode-terminal-ansiBrightRed)",
    "--color-token-terminal-ansi-bright-white": "var(--vscode-terminal-ansiBrightWhite)",
    "--color-token-terminal-ansi-bright-yellow": "var(--vscode-terminal-ansiBrightYellow)",
    "--color-token-terminal-ansi-cyan": termCyan,
    "--color-token-terminal-ansi-green": termGreen,
    "--color-token-terminal-ansi-magenta": termMagenta,
    "--color-token-terminal-ansi-red": termRed,
    "--color-token-terminal-ansi-white": termWhite,
    "--color-token-terminal-ansi-yellow": termYellow,
    "--color-token-terminal-background": termBg,
    "--color-token-terminal-border": border,
    "--color-token-terminal-foreground": termFg,
    "--color-token-terminal-inactive-selection-background": glow(accent, mode === "dark" ? 0.16 : 0.1),
    "--color-token-terminal-selection-background": select,
    "--color-token-text-code-block-background": termBg,
    "--color-token-text-link-active-foreground": linkActive,
    "--color-token-text-link-foreground": link,
    "--color-token-text-primary": ink,
    "--color-token-text-secondary": text2,
    "--color-token-text-tertiary": text3,
    "--color-token-toolbar-hover-background": hover,
    "--color-token-badge-background": badgeBg,
    "--color-token-badge-foreground": badgeFg,
    "--color-token-button-background": button,
    "--color-token-button-border": glow(button, mode === "dark" ? 0.5 : 0.7),
    "--color-token-button-foreground": buttonFg,
    "--color-token-button-secondary-hover-background": button2Hover,
    "--color-token-charts-blue": accent,
    "--color-token-charts-green": add,
    "--color-token-charts-orange": warn,
    "--color-token-charts-purple": skill,
    "--color-token-charts-red": del,
    "--color-token-charts-yellow": warn,
    "--color-token-checkbox-background": accent,
    "--color-token-checkbox-border": glow(accent, 0.72),
    "--color-token-checkbox-foreground": on(accent),
    "--color-token-description-foreground": text2,
    "--color-token-disabled-foreground": text3,

    "--shadow-elev-1": `0 0 0 1px var(--color-token-border-light)`,
    "--shadow-elev-2": `0 0 0 1px var(--color-token-border-light), 0 14px 34px ${scrim}`,
    "--shadow-elev-3": `0 0 0 1px var(--color-token-border-light), 0 28px 84px ${mode === "dark" ? "rgba(0, 0, 0, 0.42)" : "rgba(15, 23, 42, 0.18)"}`,

    "--markdown-heading": accent,
    "--markdown-text": ink,
    "--markdown-link": link,
    "--markdown-link-text": info,
    "--markdown-code": syn["--syntax-string"],
    "--markdown-block-quote": skill,
    "--markdown-emph": warn,
    "--markdown-strong": accent,
    "--markdown-horizontal-rule": border,
    "--markdown-list-item": accent,
    "--markdown-list-enumeration": info,
    "--markdown-image": accent,
    "--markdown-image-text": info,
    "--markdown-code-block": termFg,

    "--color-accent-blue": accent,
    "--color-accent-purple": skill,
    "--color-background-accent": accentBg,
    "--color-background-accent-active": accentActive,
    "--color-background-accent-hover": accentHover,
    "--color-background-button-primary": "var(--color-token-button-background)",
    "--color-background-button-primary-active": buttonHover,
    "--color-background-button-primary-hover": buttonHover,
    "--color-background-button-primary-inactive": button2,
    "--color-background-button-secondary": button2,
    "--color-background-button-secondary-active": button2Hover,
    "--color-background-button-secondary-hover": button2Hover,
    "--color-background-button-secondary-inactive": glow(ink, mode === "dark" ? 0.02 : 0.03),
    "--color-background-button-tertiary": glow(ink, 0),
    "--color-background-button-tertiary-active": hover,
    "--color-background-button-tertiary-hover": hover,
    "--color-background-control": "var(--color-token-input-background)",
    "--color-background-control-opaque": "var(--color-token-input-background)",
    "--color-background-editor-opaque": "var(--color-token-editor-background)",
    "--color-background-elevated-primary": bg3,
    "--color-background-elevated-primary-opaque": bg3,
    "--color-background-elevated-secondary": bg2,
    "--color-background-elevated-secondary-opaque": bg2,
    "--color-background-panel": "var(--color-token-dropdown-background)",
    "--color-background-surface": "var(--color-token-bg-primary)",
    "--color-background-surface-under": "var(--color-token-bg-secondary)",
    "--color-border": "var(--color-token-border)",
    "--color-border-focus": "var(--color-token-focus-border)",
    "--color-border-heavy": borderHeavy,
    "--color-border-light": "var(--color-token-border-light)",
    "--color-decoration-added": add,
    "--color-decoration-deleted": del,
    "--color-editor-added": addBg,
    "--color-editor-deleted": delBg,
    "--color-icon-accent": accent,
    "--color-icon-primary": ink,
    "--color-icon-secondary": text2,
    "--color-icon-tertiary": text3,
    "--color-simple-scrim": scrim,
    "--color-text-accent": link,
    "--color-text-button-primary": buttonFg,
    "--color-text-button-secondary": button2Fg,
    "--color-text-button-tertiary": text2,
    "--color-text-foreground": "var(--color-token-text-primary)",
    "--color-text-foreground-secondary": "var(--color-token-text-secondary)",
    "--color-text-foreground-tertiary": "var(--color-token-text-tertiary)",
  }
}

function syntax(raw: Raw) {
  const text = first(raw.colors, inkKeys) ?? raw.fg ?? "#ffffff"
  return {
    "--syntax-comment": toneVar(raw, "comment", text),
    "--syntax-string": toneVar(raw, "string", text),
    "--syntax-primitive": toneVar(raw, "primitive", text),
    "--syntax-keyword": toneVar(raw, "keyword", text),
    "--syntax-type": toneVar(raw, "type", text),
    "--syntax-function": toneVar(raw, "function", text),
    "--syntax-punctuation": toneVar(raw, "punctuation", text),
    "--syntax-variable": toneVar(raw, "variable", text),
  }
}

function first(colors: Raw["colors"], keys: string[]) {
  if (colors == null) return
  for (const key of keys) {
    const value = clean(colors[key])
    if (value) return value
  }
}

function tones(raw: Raw) {
  return [...(raw.tokenColors ?? []), ...(raw.settings ?? [])]
}

function clean(value: string | undefined, opts: { alpha?: number; chroma?: number } = {}) {
  const item = scan(value)
  if (!item) return
  const alpha = opts.alpha ?? 0
  const chroma = opts.chroma ?? 0
  if (item.alpha < alpha || pop(item) < chroma) return
  return solid(item)
}

function scan(value: string | undefined) {
  if (value == null) return
  const item = value.trim()
  if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(item)) return
  const alpha = item.length === 9 ? item.slice(7, 9) : "ff"
  return {
    alpha: Number.parseInt(alpha, 16) / 255,
    blue: Number.parseInt(item.slice(5, 7), 16),
    green: Number.parseInt(item.slice(3, 5), 16),
    red: Number.parseInt(item.slice(1, 3), 16),
  }
}

function pop(value: Rgb) {
  return Math.max(value.red, value.green, value.blue) - Math.min(value.red, value.green, value.blue)
}

function level(value: number, mode: Mode) {
  const base = anchor[mode]
  const a = base / 100
  const b = value / 100 + ((value - base) / 60) * gain
  if (value <= base) return b
  return a + (b - a) * lift
}

function view(colors: Raw["colors"], keys: string[]) {
  if (colors == null) return
  for (const key of keys) {
    const value = paint(colors[key])
    if (value) return value
  }
}

function paint(value: string | undefined, opts: { alpha?: number; chroma?: number } = {}) {
  const item = scan(value)
  if (!item) return
  const alpha = opts.alpha ?? 0
  const chroma = opts.chroma ?? 0
  if (item.alpha < alpha || pop(item) < chroma) return
  if (item.alpha < 0.999) return alphaTone(item, item.alpha)
  return solid(item)
}

function unit(value: number) {
  return Math.min(1, Math.max(0, value))
}

function mixhex(a: HexColor, b: HexColor, value: number) {
  return mixColors(a, b, unit(value))
}

function glow(color: HexColor, value: number) {
  return withAlpha(color, unit(value))
}

function up(color: HexColor, value: number) {
  return lighten(color, value)
}

function down(color: HexColor, value: number) {
  return darken(color, value)
}

function alphaTone(value: Rgb, alpha: number) {
  return `rgba(${value.red}, ${value.green}, ${value.blue}, ${trim(alpha)})`
}

function trim(value: number) {
  return unit(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
}

function solid(value: Rgb) {
  return `#${hex2(value.red)}${hex2(value.green)}${hex2(value.blue)}`
}

function hex2(value: number) {
  return value.toString(16).padStart(2, "0")
}

function on(fill: HexColor) {
  return hit(white, fill) > hit(black, fill) ? white : black
}

function hit(a: HexColor, b: HexColor) {
  const x = lum(a)
  const y = lum(b)
  const light = Math.max(x, y)
  const dark = Math.min(x, y)
  return (light + 0.05) / (dark + 0.05)
}

function lum(value: HexColor) {
  const item = scan(value)
  if (!item) return 0
  const lift = (v: number) => {
    const n = v / 255
    if (n <= 0.04045) return n / 12.92
    return Math.pow((n + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lift(item.red) + 0.7152 * lift(item.green) + 0.0722 * lift(item.blue)
}

function toneVar(raw: Raw, key: ToneVar, fallback: string) {
  const data = pickTone(raw, spec[key], fallback)
  return data?.value ?? fallback
}

function pickTone(raw: Raw, spec: Pick, fallback: string) {
  const fromSem = semantic(raw, spec.names ?? [])
  if (fromSem) return { hit: "semantic", score: 10, value: fromSem } satisfies Match
  let out: Match | undefined
  for (const item of tones(raw)) {
    const value = clean(item.settings?.foreground)
    if (!value) continue
    const score = scoreTone(item.scope, spec.keys ?? [])
    if (score <= 0) continue
    if (!out || score > out.score) out = { hit: scopeText(item.scope), score, value }
  }
  return out ?? { hit: "fallback", score: 0, value: fallback }
}

function semantic(raw: Raw, names: string[]) {
  for (const name of names) {
    const item = raw.semanticTokenColors?.[name]
    if (typeof item === "string") {
      const value = clean(item)
      if (value) return value
      continue
    }
    const value = clean(item?.foreground)
    if (value) return value
  }
}

function scoreTone(scope: Tone["scope"], keys: string[]) {
  const list = scopeList(scope)
  let out = 0
  for (const item of list) {
    for (const key of keys) {
      out = Math.max(out, score(item, key))
    }
  }
  return out
}

function score(scope: string, key: string) {
  if (scope === key) return 6
  if (scope.startsWith(`${key}.`) || scope.endsWith(`.${key}`)) return 5
  if (scope.includes(` ${key}`) || scope.includes(`${key} `)) return 4
  if (scope.includes(key)) return 3
  return 0
}

function scopeList(scope: Tone["scope"]) {
  if (scope == null) return []
  return Array.isArray(scope) ? scope : [scope]
}

function scopeText(scope: Tone["scope"]) {
  return scopeList(scope).join(", ")
}

const spec: Record<ToneVar, Pick> = {
  comment: {
    keys: ["comment", "punctuation.definition.comment"],
    names: ["comment"],
  },
  function: {
    keys: ["entity.name.function", "support.function", "variable.function", "meta.function-call", "function", "method"],
    names: ["function", "method"],
  },
  keyword: {
    keys: ["keyword", "storage", "storage.type", "storage.modifier"],
    names: ["keyword"],
  },
  primitive: {
    keys: ["constant.numeric", "constant.language", "constant.language.boolean", "constant.character.escape", "regexp", "string.regexp", "number"],
    names: ["number", "numberLiteral", "enumMember"],
  },
  punctuation: {
    keys: ["keyword.operator", "punctuation.accessor", "punctuation.definition.tag", "punctuation.bracket", "punctuation.separator", "punctuation"],
  },
  string: {
    keys: ["string", "string.quoted", "constant.other.symbol", "entity.other.attribute-name"],
    names: ["string", "stringLiteral"],
  },
  type: {
    keys: ["entity.name.type", "entity.other.inherited-class", "support.class", "support.type", "class", "type"],
    names: ["type", "class"],
  },
  variable: {
    keys: ["variable", "meta.object-literal.key", "meta.object.member", "meta.property-name", "property", "parameter"],
    names: ["variable", "parameter", "property", "variable.constant", "variable.defaultLibrary", "namespace"],
  },
}
