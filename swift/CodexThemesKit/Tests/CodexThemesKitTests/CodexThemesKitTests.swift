import Testing
@testable import CodexThemesKit

@Test func registryCountsMatchRecoveredThemes() throws {
    #expect(CodexThemes.items.count == 25)
    #expect(CodexThemes.allVariants().count == 37)
    #expect(CodexThemes.availableThemes(.dark).count == 24)
    #expect(CodexThemes.availableThemes(.light).count == 13)
}

@Test func invalidThemeFallsBackToCodex() throws {
    #expect(CodexThemes.pickTheme("__missing__", mode: .dark).id == "codex")
    #expect(CodexThemes.pickTheme("proof", mode: .dark).id == "codex")
}

@Test func linearDarkThemeSeedMatchesRecoveredData() throws {
    let patch = try CodexThemes.loadThemeSeed("linear", mode: .dark)
    let seed = CodexThemes.normalizeThemeSeed(patch, mode: .dark)

    #expect(seed.accent == "#5e6ad2")
    #expect(seed.surface == "#17181d")
    #expect(seed.ink == "#e6e9ef")
    #expect(seed.fonts.ui == "Inter")
    #expect(seed.opaqueWindows == true)
}

@Test func resolvedThemeProducesChromeTokens() throws {
    let theme = try CodexThemes.resolvedTheme("linear", mode: .dark)

    #expect(theme.tokens["--codex-base-accent"] == "#5e6ad2")
    #expect(theme.tokens["--color-background-surface"] == "#17181d")
    #expect(theme.tokens["--color-text-foreground"] == "#e6e9ef")
    #expect(theme.tokens["--color-background-panel"] != nil)
    #expect(theme.tokens["--color-border-focus"] != nil)
}

@Test func allRecoveredThemesResolve() throws {
    for mode in CodexThemeMode.allCases {
        for item in CodexThemes.availableThemes(mode) {
            let theme = try CodexThemes.resolvedTheme(item.id, mode: mode)
            #expect(theme.item.id == item.id)
            #expect(theme.tokens["--color-background-surface"] != nil)
            #expect(theme.tokens["--color-text-foreground"] != nil)
        }
    }
}

@Test func contrastOverridesMatchRecoveredData() throws {
    let cases: [(String, CodexThemeMode, Int, String, String, String, String)] = [
        ("linear", .dark, 0, "#191a1f", "rgba(125, 135, 219, 0.63)", "rgba(28, 29, 34, 0.96)", "#15161b"),
        ("linear", .dark, 100, "#2c2d32", "rgba(199, 203, 239, 0.933)", "rgba(60, 61, 66, 0.96)", "#121317"),
        ("codex", .light, 90, "#ffffff", "#0169cc", "rgba(255, 255, 255, 0.96)", "#e8e8e8"),
        ("proof", .light, 10, "#f7f5f0", "#3d755d", "rgba(246, 244, 238, 0.96)", "#f5f3ed"),
    ]

    for item in cases {
        let theme = try CodexThemes.resolvedTheme(item.0, mode: item.1, chrome: CodexThemePatch(contrast: item.2))
        #expect(theme.seed.contrast == item.2)
        #expect(theme.tokens["--color-background-panel"] == item.3)
        #expect(theme.tokens["--color-border-focus"] == item.4)
        #expect(theme.tokens["--color-background-control"] == item.5)
        #expect(theme.tokens["--color-background-surface-under"] == item.6)
    }
}
