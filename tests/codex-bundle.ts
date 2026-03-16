import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"

type Mode = "light" | "dark"

type Item = {
  id: string
  label: string
  registrationByVariant: Partial<Record<Mode, unknown>>
}

type Seed = {
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

type Entry = {
  files?: Record<string, Entry>
  offset?: string
  size?: number
}

type Bundle = {
  availableThemes: (mode?: Mode) => Item[]
  hasTheme: (id: string) => boolean
  items: Item[]
  loadThemeSeed: (id: string, mode: Mode) => Promise<Seed>
  normalizeThemeSeed: (seed: Partial<Seed> | undefined, mode: Mode) => Seed
  pickTheme: (id: string, mode: Mode) => Item
  resolveChromeThemeVariables: (seed: Partial<Seed> | undefined, mode: Mode) => Record<string, string>
  variant: (id: string, mode: Mode) => unknown
}

const app = "/Applications/Codex.app/Contents/Resources/app.asar"
const entry = "webview/assets/use-resolved-theme-variant-BAd0ax8d.js"

const ids = {
  ABSOLUTELY: "absolutely",
  AYU: "ayu",
  CATPPUCCIN: "catppuccin",
  CODEX: "codex",
  DRACULA: "dracula",
  EVERFOREST: "everforest",
  GITHUB: "github",
  GRUVBOX: "gruvbox",
  LINEAR: "linear",
  LOBSTER: "lobster",
  MATERIAL: "material",
  MATRIX: "matrix",
  MONOKAI: "monokai",
  NIGHT_OWL: "night-owl",
  NORD: "nord",
  NOTION: "notion",
  ONE: "one",
  OSCURANGE: "oscurange",
  PROOF: "proof",
  ROSE_PINE: "rose-pine",
  SENTRY: "sentry",
  SOLARIZED: "solarized",
  TEMPLE: "temple",
  TOKYO_NIGHT: "tokyo-night",
  VSCODE_PLUS: "vscode-plus",
} as const

let cache: Promise<Bundle> | undefined

export function loadBundle() {
  return (cache ??= init())
}

async function init() {
  const file = await readFile(app)
  const size = file.readUInt32LE(12)
  const head = JSON.parse(file.subarray(16, 16 + size).toString("utf8")) as Entry
  const root = 16 + size

  const read = (name: string) => {
    let node: Entry | undefined = head
    for (const part of name.split("/")) {
      node = node.files?.[part]
      if (node == null) throw new Error(`Missing asar entry: ${name}`)
    }
    if (node.offset == null || node.size == null) throw new Error(`Invalid asar entry: ${name}`)
    const off = root + Number(node.offset)
    return file.subarray(off, off + node.size)
  }

  const src = read(entry).toString("utf8")
  const start = src.indexOf("const fu=")
  const end = src.indexOf("var Nd=i();")
  if (start < 0 || end < 0) throw new Error("Failed to locate Codex theme source in bundle")

  let body = src.slice(start, end)
  const files = [...new Set([...body.matchAll(/import\(`\.\/([^`]+\.js)`\)/g)].map((item) => item[1]))]
  const dir = await mkdtemp(path.join(tmpdir(), "codex-theme-bundle-"))

  await Promise.all(
    files.map(async (file) => {
      const text = read(`webview/assets/${file}`).toString("utf8").replace(/\n\/\/# sourceMappingURL=.*$/m, "")
      await writeFile(path.join(dir, file), text)
    }),
  )

  body = body.replace(/r\(\(\)=>import\(`\.\/([^`]+\.js)`\),\[\],import\.meta\.url\)/g, "r(()=>import('./$1'))")

  const mod = [
    `const l = ${JSON.stringify(ids)}`,
    `const r = (load) => load()`,
    body,
    `export {`,
    `  sd as availableThemes,`,
    `  ld as hasTheme,`,
    `  id as items,`,
    `  dd as loadThemeSeed,`,
    `  Su as normalizeThemeSeed,`,
    `  od as pickTheme,`,
    `  wu as resolveChromeThemeVariables,`,
    `  ud as variant,`,
    `}`,
    ``,
  ].join("\n")

  const out = path.join(dir, "bundle.mjs")
  await writeFile(out, mod)
  return (await import(pathToFileURL(out).href)) as Bundle
}
