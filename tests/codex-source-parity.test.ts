import { describe, expect, test } from "vitest"
import {
  availableThemes,
  hasTheme,
  loadThemeSeed,
  normalizeThemeSeed,
  pickTheme,
  resolveChromeThemeVariables,
  type Item,
  type Mode,
  type ThemeSeed,
} from "../src/codex/source"
import { loadBundle } from "./codex-bundle"

function view(list: Item[]) {
  return list.map((item) => ({
    id: item.id,
    label: item.label,
    variants: Object.keys(item.registrationByVariant).sort(),
  }))
}

const modes = ["light", "dark"] as const satisfies readonly Mode[]

describe("Codex theme parity", () => {
  test("matches available theme lists by variant", async () => {
    const bundle = await loadBundle()
    expect(view(availableThemes())).toEqual(view(bundle.availableThemes()))
    for (const mode of modes) {
      expect(view(availableThemes(mode))).toEqual(view(bundle.availableThemes(mode)))
    }
  })

  test("matches theme lookup for known theme ids", async () => {
    const bundle = await loadBundle()
    const ids = [...new Set(modes.flatMap((mode) => availableThemes(mode).map((item) => item.id)))]
    for (const mode of modes) {
      for (const id of ids) {
        const a = pickTheme(id, mode)
        const b = bundle.pickTheme(id, mode)
        expect(view([a])).toEqual(view([b]))
      }
    }
  })

  test("matches theme existence checks", async () => {
    const bundle = await loadBundle()
    const ids = [...new Set(availableThemes().map((item) => item.id))]
    for (const id of ids) {
      expect(hasTheme(id)).toBe(bundle.hasTheme(id))
    }
    expect(hasTheme("__missing__")).toBe(bundle.hasTheme("__missing__"))
  })

  test("matches invalid-id fallback behavior", async () => {
    const bundle = await loadBundle()
    expect(pickTheme("__missing__", "dark").id).toBe("codex")
    expect(bundle.pickTheme("__missing__", "dark").id).toBe("codex")
  })

  test("matches inferred theme seeds for every bundled theme variant", async () => {
    const bundle = await loadBundle()
    for (const mode of modes) {
      for (const item of availableThemes(mode)) {
        const a = await loadThemeSeed(item.id, mode)
        const b = await bundle.loadThemeSeed(item.id, mode)
        expect(a).toEqual(b)
      }
    }
  })

  test("matches normalized chrome seeds", async () => {
    const bundle = await loadBundle()
    const list = [
      undefined,
      {},
      {
        accent: "#123456",
        contrast: 140,
        fonts: { code: " Fira Code ", ui: "  " },
        ink: "#eeeeee",
        opaqueWindows: true,
        semanticColors: {
          diffAdded: "#00ff00",
          diffRemoved: "#ff0000",
          skill: "#654321",
        },
        surface: "#101010",
      },
      {
        accent: "#abcdef12",
        contrast: -40,
        fonts: { code: null, ui: null },
        ink: "#11223344",
        semanticColors: {
          diffAdded: "#13579080",
          diffRemoved: "#246801",
        },
      } satisfies Partial<ThemeSeed> as unknown as Partial<ThemeSeed>,
    ]
    for (const mode of modes) {
      for (const item of list) {
        expect(normalizeThemeSeed(item, mode)).toEqual(bundle.normalizeThemeSeed(item, mode))
      }
    }
  })

  test("matches resolved chrome variables for every bundled theme variant", async () => {
    const bundle = await loadBundle()
    for (const mode of modes) {
      for (const item of availableThemes(mode)) {
        const seed = normalizeThemeSeed(await loadThemeSeed(item.id, mode), mode)
        const raw = await bundle.loadThemeSeed(item.id, mode)
        const next = bundle.normalizeThemeSeed(raw, mode)
        expect(resolveChromeThemeVariables(seed, mode)).toEqual(bundle.resolveChromeThemeVariables(next, mode))
      }
    }
  })
})
