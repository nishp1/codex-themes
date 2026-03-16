import { describe, expect, test } from "vitest"
import { availableThemes, loadThemeSeed, normalizeThemeSeed } from "../src/codex/source"
import {
  config,
  importThemeString,
  mergeTheme,
  parseThemeString,
  serializeThemeString,
  themeKeys,
} from "../src/codex/service"

describe("Codex theme service parity", () => {
  test("matches recovered appearance config keys", () => {
    expect(config.APPEARANCE_THEME).toBe("appearanceTheme")
    expect(config.APPEARANCE_LIGHT_CHROME_THEME).toBe("appearanceLightChromeTheme")
    expect(config.APPEARANCE_DARK_CHROME_THEME).toBe("appearanceDarkChromeTheme")
    expect(config.APPEARANCE_LIGHT_CODE_THEME_ID).toBe("appearanceLightCodeThemeId")
    expect(config.APPEARANCE_DARK_CODE_THEME_ID).toBe("appearanceDarkCodeThemeId")
    expect(themeKeys("light")).toEqual({
      chromeThemeConfigurationKey: "appearanceLightChromeTheme",
      codeThemeConfigurationKey: "appearanceLightCodeThemeId",
    })
    expect(themeKeys("dark")).toEqual({
      chromeThemeConfigurationKey: "appearanceDarkChromeTheme",
      codeThemeConfigurationKey: "appearanceDarkCodeThemeId",
    })
  })

  test("round-trips share strings", async () => {
    const theme = normalizeThemeSeed(await loadThemeSeed("linear", "dark"), "dark")
    const value = serializeThemeString({
      codeThemeId: "linear",
      theme,
      variant: "dark",
    })
    expect(parseThemeString(value)).toEqual({
      codeThemeId: "linear",
      theme,
      variant: "dark",
    })
  })

  test("accepts uri-encoded share payloads", async () => {
    const theme = normalizeThemeSeed(await loadThemeSeed("codex", "light"), "light")
    const value = `codex-theme-v1:${encodeURIComponent(
      JSON.stringify({
        codeThemeId: "codex",
        theme,
        variant: "light",
      }),
    )}`
    expect(parseThemeString(value)).toEqual({
      codeThemeId: "codex",
      theme,
      variant: "light",
    })
  })

  test("rejects mismatched import variants", async () => {
    const theme = normalizeThemeSeed(await loadThemeSeed("codex", "light"), "light")
    const value = serializeThemeString({
      codeThemeId: "codex",
      theme,
      variant: "light",
    })
    expect(() => importThemeString(value, "dark", availableThemes("dark"))).toThrow("Theme variant mismatch")
  })

  test("rejects unavailable code themes for a variant", async () => {
    const theme = normalizeThemeSeed(await loadThemeSeed("proof", "light"), "light")
    const value = serializeThemeString({
      codeThemeId: "proof",
      theme,
      variant: "light",
    })
    expect(() => importThemeString(value, "light", availableThemes("dark"))).toThrow("Theme code theme mismatch")
  })

  test("merges nested fonts and semantic colors like Codex", async () => {
    const theme = normalizeThemeSeed(await loadThemeSeed("codex", "dark"), "dark")
    expect(
      mergeTheme(theme, {
        accent: "#123456",
        fonts: { code: "Berkeley Mono" },
        semanticColors: { skill: "#654321" },
      }),
    ).toEqual({
      ...theme,
      accent: "#123456",
      fonts: {
        ...theme.fonts,
        code: "Berkeley Mono",
      },
      semanticColors: {
        ...theme.semanticColors,
        skill: "#654321",
      },
    })
  })
})
