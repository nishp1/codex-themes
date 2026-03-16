import Foundation

public enum CodexThemeMode: String, CaseIterable, Codable, Sendable {
    case dark
    case light
}

public struct CodexThemeFonts: Codable, Equatable, Sendable {
    public var code: String?
    public var ui: String?

    public init(code: String? = nil, ui: String? = nil) {
        self.code = code
        self.ui = ui
    }
}

public struct CodexThemeFontsPatch: Codable, Equatable, Sendable {
    public var code: String?
    public var ui: String?

    public init(code: String? = nil, ui: String? = nil) {
        self.code = code
        self.ui = ui
    }
}

public struct CodexThemeSemanticColors: Codable, Equatable, Sendable {
    public var diffAdded: String
    public var diffRemoved: String
    public var skill: String

    public init(diffAdded: String, diffRemoved: String, skill: String) {
        self.diffAdded = diffAdded
        self.diffRemoved = diffRemoved
        self.skill = skill
    }
}

public struct CodexThemeSemanticColorsPatch: Codable, Equatable, Sendable {
    public var diffAdded: String?
    public var diffRemoved: String?
    public var skill: String?

    public init(diffAdded: String? = nil, diffRemoved: String? = nil, skill: String? = nil) {
        self.diffAdded = diffAdded
        self.diffRemoved = diffRemoved
        self.skill = skill
    }
}

public struct CodexThemeSeed: Codable, Equatable, Sendable {
    public var accent: String
    public var contrast: Int
    public var fonts: CodexThemeFonts
    public var ink: String
    public var opaqueWindows: Bool
    public var semanticColors: CodexThemeSemanticColors
    public var surface: String

    public init(
        accent: String,
        contrast: Int,
        fonts: CodexThemeFonts,
        ink: String,
        opaqueWindows: Bool,
        semanticColors: CodexThemeSemanticColors,
        surface: String
    ) {
        self.accent = accent
        self.contrast = contrast
        self.fonts = fonts
        self.ink = ink
        self.opaqueWindows = opaqueWindows
        self.semanticColors = semanticColors
        self.surface = surface
    }
}

public struct CodexThemePatch: Codable, Equatable, Sendable {
    public var accent: String?
    public var contrast: Int?
    public var fonts: CodexThemeFontsPatch?
    public var ink: String?
    public var opaqueWindows: Bool?
    public var semanticColors: CodexThemeSemanticColorsPatch?
    public var surface: String?

    public init(
        accent: String? = nil,
        contrast: Int? = nil,
        fonts: CodexThemeFontsPatch? = nil,
        ink: String? = nil,
        opaqueWindows: Bool? = nil,
        semanticColors: CodexThemeSemanticColorsPatch? = nil,
        surface: String? = nil
    ) {
        self.accent = accent
        self.contrast = contrast
        self.fonts = fonts
        self.ink = ink
        self.opaqueWindows = opaqueWindows
        self.semanticColors = semanticColors
        self.surface = surface
    }
}

public struct CodexToneSettings: Codable, Equatable, Sendable {
    public var foreground: String?

    public init(foreground: String? = nil) {
        self.foreground = foreground
    }
}

public struct CodexSemanticToken: Codable, Equatable, Sendable {
    public var foreground: String?

    enum CodingKeys: String, CodingKey {
        case foreground
    }

    public init(foreground: String? = nil) {
        self.foreground = foreground
    }

    public init(from decoder: Decoder) throws {
        let box = try decoder.singleValueContainer()
        if let value = try? box.decode(String.self) {
            foreground = value
            return
        }
        let item = try decoder.container(keyedBy: CodingKeys.self)
        foreground = try item.decodeIfPresent(String.self, forKey: .foreground)
    }
}

public struct CodexTone: Codable, Equatable, Sendable {
    public var scope: [String]?
    public var settings: CodexToneSettings?

    public init(scope: [String]? = nil, settings: CodexToneSettings? = nil) {
        self.scope = scope
        self.settings = settings
    }

    enum CodingKeys: String, CodingKey {
        case scope
        case settings
    }

    public init(from decoder: Decoder) throws {
        let box = try decoder.container(keyedBy: CodingKeys.self)
        if let list = try? box.decode([String].self, forKey: .scope) {
            scope = list
        } else if let value = try? box.decode(String.self, forKey: .scope) {
            scope = [value]
        } else {
            scope = nil
        }
        settings = try box.decodeIfPresent(CodexToneSettings.self, forKey: .settings)
    }
}

public struct CodexRawTheme: Codable, Equatable, Sendable {
    public var bg: String?
    public var chromeTheme: CodexThemePatch?
    public var colors: [String: String]?
    public var displayName: String?
    public var fg: String?
    public var name: String
    public var semanticTokenColors: [String: CodexSemanticToken]?
    public var settings: [CodexTone]?
    public var tokenColors: [CodexTone]?
    public var type: String?

    public init(
        bg: String? = nil,
        chromeTheme: CodexThemePatch? = nil,
        colors: [String: String]? = nil,
        displayName: String? = nil,
        fg: String? = nil,
        name: String,
        semanticTokenColors: [String: CodexSemanticToken]? = nil,
        settings: [CodexTone]? = nil,
        tokenColors: [CodexTone]? = nil,
        type: String? = nil
    ) {
        self.bg = bg
        self.chromeTheme = chromeTheme
        self.colors = colors
        self.displayName = displayName
        self.fg = fg
        self.name = name
        self.semanticTokenColors = semanticTokenColors
        self.settings = settings
        self.tokenColors = tokenColors
        self.type = type
    }

    enum CodingKeys: String, CodingKey {
        case bg
        case chromeTheme
        case colors
        case displayName
        case fg
        case name
        case semanticTokenColors
        case settings
        case tokenColors
        case type
    }

    struct Key: CodingKey {
        let stringValue: String
        let intValue: Int?

        init?(stringValue: String) {
            self.stringValue = stringValue
            intValue = nil
        }

        init?(intValue: Int) {
            stringValue = "\(intValue)"
            self.intValue = intValue
        }
    }

    public init(from decoder: Decoder) throws {
        let box = try decoder.container(keyedBy: CodingKeys.self)
        bg = try box.decodeIfPresent(String.self, forKey: .bg)
        chromeTheme = try box.decodeIfPresent(CodexThemePatch.self, forKey: .chromeTheme)
        displayName = try box.decodeIfPresent(String.self, forKey: .displayName)
        fg = try box.decodeIfPresent(String.self, forKey: .fg)
        name = try box.decode(String.self, forKey: .name)
        semanticTokenColors = try box.decodeIfPresent([String: CodexSemanticToken].self, forKey: .semanticTokenColors)
        settings = try box.decodeIfPresent([CodexTone].self, forKey: .settings)
        tokenColors = try box.decodeIfPresent([CodexTone].self, forKey: .tokenColors)
        type = try box.decodeIfPresent(String.self, forKey: .type)
        guard box.contains(.colors) else {
            colors = nil
            return
        }
        let nested = try box.nestedContainer(keyedBy: Key.self, forKey: .colors)
        let parsed = nested.allKeys.reduce(into: [String: String]()) { out, key in
            guard let value = try? nested.decode(String.self, forKey: key) else {
                return
            }
            out[key.stringValue] = value
        }
        colors = parsed.isEmpty ? nil : parsed
    }
}

public struct CodexThemeVariant: Hashable, Sendable {
    public let name: String
    let resource: String

    public init(name: String, resource: String) {
        self.name = name
        self.resource = resource
    }
}

public struct CodexThemeItem: Hashable, Sendable {
    public let id: String
    public let label: String
    public let registrationByVariant: [CodexThemeMode: CodexThemeVariant]

    public init(id: String, label: String, registrationByVariant: [CodexThemeMode: CodexThemeVariant]) {
        self.id = id
        self.label = label
        self.registrationByVariant = registrationByVariant
    }
}

public struct CodexResolvedTheme: Equatable, Sendable {
    public let item: CodexThemeItem
    public let raw: CodexRawTheme
    public let seed: CodexThemeSeed
    public let tokens: [String: String]

    public init(item: CodexThemeItem, raw: CodexRawTheme, seed: CodexThemeSeed, tokens: [String: String]) {
        self.item = item
        self.raw = raw
        self.seed = seed
        self.tokens = tokens
    }
}

public enum CodexThemeError: Error, LocalizedError {
    case missingTheme(String)
    case missingVariant(String, CodexThemeMode)
    case missingResource(String)

    public var errorDescription: String? {
        switch self {
        case let .missingTheme(id):
            return "Missing theme: \(id)"
        case let .missingVariant(id, mode):
            return "Missing \(mode.rawValue) theme variant for \(id)"
        case let .missingResource(name):
            return "Missing theme resource: \(name)"
        }
    }
}

public enum CodexThemes {
    public static func allVariants() -> [CodexThemeVariant] {
        items.flatMap { $0.registrationByVariant.values }
    }

    public static func hasTheme(_ id: String) -> Bool {
        ids.contains(id)
    }

    public static func availableThemes(_ mode: CodexThemeMode? = nil) -> [CodexThemeItem] {
        items
            .filter { mode == nil || $0.registrationByVariant[mode!] != nil }
            .sorted { $0.label.localizedCaseInsensitiveCompare($1.label) == .orderedAscending }
    }

    public static func pickTheme(_ id: String, mode: CodexThemeMode) -> CodexThemeItem {
        let list = availableThemes(mode)
        if let item = list.first(where: { $0.id == id }) {
            return item
        }
        if let item = list.first(where: { $0.id == fallback }) {
            return item
        }
        return list.first ?? items[0]
    }

    public static func variant(_ item: String, mode: CodexThemeMode) throws -> CodexThemeVariant {
        let entry = pickTheme(item, mode: mode)
        guard let reg = entry.registrationByVariant[mode] else {
            throw CodexThemeError.missingVariant(item, mode)
        }
        return reg
    }

    public static func variant(_ item: CodexThemeItem, mode: CodexThemeMode) throws -> CodexThemeVariant {
        try variant(item.id, mode: mode)
    }

    public static func loadRawTheme(_ item: String, mode: CodexThemeMode) throws -> CodexRawTheme {
        let reg = try variant(item, mode: mode)
        return try load(resource: reg.resource)
    }

    public static func loadRawTheme(_ item: CodexThemeItem, mode: CodexThemeMode) throws -> CodexRawTheme {
        try loadRawTheme(item.id, mode: mode)
    }

    public static func loadThemeSeed(_ item: String, mode: CodexThemeMode) throws -> CodexThemePatch {
        let raw = try loadRawTheme(item, mode: mode)
        return mergeThemeSeed(resolveThemeSeed(raw, mode: mode), raw.chromeTheme)
    }

    public static func loadThemeSeed(_ item: CodexThemeItem, mode: CodexThemeMode) throws -> CodexThemePatch {
        try loadThemeSeed(item.id, mode: mode)
    }

    public static func normalizeThemeSeed(_ seed: CodexThemePatch?, mode: CodexThemeMode) -> CodexThemeSeed {
        let ref = base[mode]!
        return CodexThemeSeed(
            accent: cleanHex(seed?.accent) ?? ref.accent,
            contrast: clamp(seed?.contrast, fallback: ref.contrast),
            fonts: cleanFonts(seed?.fonts),
            ink: cleanHex(seed?.ink) ?? ref.ink,
            opaqueWindows: seed?.opaqueWindows ?? ref.opaqueWindows,
            semanticColors: cleanSemantics(seed?.semanticColors, fallback: ref.semanticColors),
            surface: cleanHex(seed?.surface) ?? ref.surface
        )
    }

    public static func resolveChromeThemeTokens(_ seed: CodexThemeSeed, mode: CodexThemeMode) -> [String: String] {
        let ctx = context(seed, mode: mode)
        let colors = mode == .light ? light(ctx) : dark(ctx)
        return vars(ctx, colors)
    }

    public static func resolvedTheme(_ item: String, mode: CodexThemeMode, chrome: CodexThemePatch? = nil) throws -> CodexResolvedTheme {
        let picked = pickTheme(item, mode: mode)
        let raw = try loadRawTheme(item, mode: mode)
        let patch = mergeThemeSeed(mergeThemeSeed(resolveThemeSeed(raw, mode: mode), raw.chromeTheme), chrome)
        let seed = normalizeThemeSeed(patch, mode: mode)
        return CodexResolvedTheme(
            item: picked,
            raw: raw,
            seed: seed,
            tokens: resolveChromeThemeTokens(seed, mode: mode)
        )
    }

    public static func resolvedTheme(_ item: CodexThemeItem, mode: CodexThemeMode, chrome: CodexThemePatch? = nil) throws -> CodexResolvedTheme {
        try resolvedTheme(item.id, mode: mode, chrome: chrome)
    }

    public static func resolveThemeSeed(_ raw: CodexRawTheme, mode: CodexThemeMode) -> CodexThemePatch {
        let ref = base[mode]!
        let surface = firstColor(raw.colors, bgKeys) ?? ref.surface
        let ink = firstColor(raw.colors, inkKeys) ?? ref.ink
        let accent = inferAccent(raw, surface: surface, ink: ink) ?? ref.accent
        return CodexThemePatch(
            accent: accent,
            ink: ink,
            semanticColors: CodexThemeSemanticColorsPatch(
                diffAdded: firstColor(raw.colors, addKeys) ?? inferHue(raw, surface: surface, ink: ink, range: addRange, anchor: addHue) ?? ref.semanticColors.diffAdded,
                diffRemoved: firstColor(raw.colors, delKeys) ?? inferHue(raw, surface: surface, ink: ink, range: delRange, anchor: delHue) ?? ref.semanticColors.diffRemoved,
                skill: firstColor(raw.colors, skillKeys) ?? inferHue(raw, surface: surface, ink: ink, range: skillRange, anchor: skillHue) ?? (!near(accent, surface) && !near(accent, ink) ? accent : ref.semanticColors.skill)
            ),
            surface: surface
        )
    }

    public static func mergeThemeSeed(_ seed: CodexThemePatch, _ chrome: CodexThemePatch?) -> CodexThemePatch {
        guard let chrome else {
            return seed
        }
        return CodexThemePatch(
            accent: chrome.accent ?? seed.accent,
            contrast: chrome.contrast ?? seed.contrast,
            fonts: mergeFonts(seed.fonts, chrome.fonts),
            ink: chrome.ink ?? seed.ink,
            opaqueWindows: chrome.opaqueWindows ?? seed.opaqueWindows,
            semanticColors: mergeSemantics(seed.semanticColors, chrome.semanticColors),
            surface: chrome.surface ?? seed.surface
        )
    }

    private struct RGB {
        let red: Int
        let green: Int
        let blue: Int
    }

    private struct Hex {
        let red: Int
        let green: Int
        let blue: Int
        let alpha: Double
    }

    private struct Range {
        let min: Double
        let max: Double
    }

    private struct ThemeContext {
        let accent: RGB
        let contrast: Double
        let editorBackground: RGB
        let ink: RGB
        let surface: RGB
        let surfaceUnder: String
        let theme: CodexThemeSeed
        let variant: CodexThemeMode
    }

    private struct ChromeColors {
        let accentBackground: String
        let accentBackgroundActive: String
        let accentBackgroundHover: String
        let border: String
        let borderFocus: String
        let borderHeavy: String
        let borderLight: String
        let buttonPrimaryBackground: String
        let buttonPrimaryBackgroundActive: String
        let buttonPrimaryBackgroundHover: String
        let buttonPrimaryBackgroundInactive: String
        let buttonSecondaryBackground: String
        let buttonSecondaryBackgroundActive: String
        let buttonSecondaryBackgroundHover: String
        let buttonSecondaryBackgroundInactive: String
        let buttonTertiaryBackground: String
        let buttonTertiaryBackgroundActive: String
        let buttonTertiaryBackgroundHover: String
        let controlBackground: String
        let controlBackgroundOpaque: String
        let elevatedPrimary: String
        let elevatedPrimaryOpaque: String
        let elevatedSecondary: String
        let elevatedSecondaryOpaque: String
        let iconAccent: String
        let iconPrimary: String
        let iconSecondary: String
        let iconTertiary: String
        let simpleScrim: String
        let textAccent: String
        let textButtonPrimary: String
        let textButtonSecondary: String
        let textButtonTertiary: String
        let textForeground: String
        let textForegroundSecondary: String
        let textForegroundTertiary: String
    }

    private static let fallback = "codex"
    private static let bundleName = "CodexThemesKit_CodexThemesKit"
    private static let black = RGB(red: 0, green: 0, blue: 0)
    private static let white = RGB(red: 255, green: 255, blue: 255)

    private static let base: [CodexThemeMode: CodexThemeSeed] = [
        .dark: CodexThemeSeed(
            accent: "#339cff",
            contrast: 60,
            fonts: CodexThemeFonts(),
            ink: "#ffffff",
            opaqueWindows: false,
            semanticColors: CodexThemeSemanticColors(diffAdded: "#40c977", diffRemoved: "#fa423e", skill: "#ad7bf9"),
            surface: "#181818"
        ),
        .light: CodexThemeSeed(
            accent: "#0285ff",
            contrast: 45,
            fonts: CodexThemeFonts(),
            ink: "#0d0d0d",
            opaqueWindows: false,
            semanticColors: CodexThemeSemanticColors(diffAdded: "#00a240", diffRemoved: "#ba2623", skill: "#924ff7"),
            surface: "#ffffff"
        ),
    ]

    private static let anchor: [CodexThemeMode: Int] = [
        .dark: 60,
        .light: 45,
    ]

    private static let gain = 0.7
    private static let lift = 2.0
    private static let shadow: [CodexThemeMode: Double] = [
        .dark: 0.16,
        .light: 0.04,
    ]

    private static let sink: [CodexThemeMode: Double] = [
        .dark: 0.0015,
        .light: 0.0012,
    ]

    private static let panel: [CodexThemeMode: Double] = [
        .dark: 0.03,
        .light: 0.18,
    ]

    private static let haze: [CodexThemeMode: Double] = [
        .dark: 0.03,
        .light: 0.008,
    ]

    private static let fillMin = 0.45
    private static let popMin = 24.0
    private static let addRange = Range(min: 80, max: 170)
    private static let addHue = 125.0
    private static let delRange = Range(min: 345, max: 15)
    private static let delHue = 0.0
    private static let skillRange = Range(min: 210, max: 320)
    private static let skillHue = 265.0

    private static let bgKeys = [
        "editor.background",
        "sideBar.background",
        "editorGroupHeader.tabsBackground",
        "panel.background",
        "activityBar.background",
    ]

    private static let inkKeys = [
        "editor.foreground",
        "sideBarTitle.foreground",
        "sideBar.foreground",
        "foreground",
    ]

    private static let accentKeys = [
        "activityBarBadge.background",
        "textLink.foreground",
        "editorCursor.foreground",
        "focusBorder",
        "button.background",
        "activityBar.activeBorder",
    ]

    private static let addKeys = [
        "gitDecoration.addedResourceForeground",
        "gitDecoration.untrackedResourceForeground",
        "terminal.ansiGreen",
        "terminal.ansiBrightGreen",
    ]

    private static let delKeys = [
        "gitDecoration.deletedResourceForeground",
        "terminal.ansiRed",
        "terminal.ansiBrightRed",
    ]

    private static let skillKeys = [
        "charts.purple",
        "terminal.ansiMagenta",
        "terminal.ansiBrightMagenta",
    ]

    public static let items: [CodexThemeItem] = [
        entry("ayu", "Ayu", dark: ("Ayu Dark", "ayu-dark-DeoI9BGU")),
        entry("catppuccin", "Catppuccin", dark: ("Catppuccin Mocha", "catppuccin-mocha-Ry8aD-5u"), light: ("Catppuccin Latte", "catppuccin-latte-Bd1wq-gC")),
        entry("absolutely", "Absolutely", dark: ("Absolutely Dark", "absolutely-dark-Zl820baI"), light: ("Absolutely Light", "absolutely-light-C6b2RFMx")),
        entry("codex", "Codex", dark: ("Codex Dark", "codex-dark-Br6nfceT"), light: ("Codex Light", "codex-light-pdN2IJ9S")),
        entry("dracula", "Dracula", dark: ("dracula", "dracula-D9Il0_zR")),
        entry("everforest", "Everforest", dark: ("everforest-dark", "everforest-dark-Cj8fMfjQ"), light: ("everforest-light", "everforest-light-B_wG5yZi")),
        entry("github", "GitHub", dark: ("github-dark-default", "github-dark-default-DWyfTly1"), light: ("github-light-default", "github-light-default-CIhlemFQ")),
        entry("gruvbox", "Gruvbox", dark: ("gruvbox-dark-medium", "gruvbox-dark-medium-ci87zucd"), light: ("gruvbox-light-medium", "gruvbox-light-medium-CyPozz0g")),
        entry("linear", "Linear", dark: ("Linear Dark", "linear-dark-0f3KBJw5"), light: ("Linear Light", "linear-light-BuTxgnpC")),
        entry("lobster", "Lobster", dark: ("Lobster Dark", "lobster-dark-dxSKfHK-")),
        entry("material", "Material", dark: ("material-theme-darker", "material-theme-darker-D-xFZPe6")),
        entry("matrix", "Matrix", dark: ("Matrix Dark", "matrix-dark-CnDvzfwM")),
        entry("monokai", "Monokai", dark: ("monokai", "monokai-C5zO3RFM")),
        entry("night-owl", "Night Owl", dark: ("night-owl", "night-owl-DnK0oU3N")),
        entry("nord", "Nord", dark: ("nord", "nord-DEoO_SK5")),
        entry("notion", "Notion", dark: ("Notion Dark", "notion-dark-BTRKJ-yg"), light: ("Notion Light", "notion-light-CtgtIlWb")),
        entry("oscurange", "Oscurange", dark: ("Oscurange", "oscurange-C-9zjgEq")),
        entry("one", "One", dark: ("one-dark-pro", "one-dark-pro-D-HQrStr"), light: ("one-light", "one-light-CJA2ZR8h")),
        entry("proof", "Proof", light: ("Proof Light", "proof-light-B7vsCcYh")),
        entry("rose-pine", "Rose Pine", dark: ("rose-pine-moon", "rose-pine-moon-BttsuGa9"), light: ("rose-pine-dawn", "rose-pine-dawn-koa58u7m")),
        entry("sentry", "Sentry", dark: ("Sentry Dark", "sentry-dark-QRQbAa_B")),
        entry("solarized", "Solarized", dark: ("solarized-dark", "solarized-dark-B0lR0uIV"), light: ("solarized-light", "solarized-light-CvAm3SjJ")),
        entry("tokyo-night", "Tokyo Night", dark: ("tokyo-night", "tokyo-night-xCIIK3YY")),
        entry("temple", "Temple", dark: ("Temple Dark", "temple-dark-1ouW2SxA")),
        entry("vscode-plus", "VS Code Plus", dark: ("dark-plus", "dark-plus-B1yOZ-Hy"), light: ("light-plus", "light-plus-DBeuRQRE")),
    ]

    private static let ids = Set(items.map(\.id))

    private static func entry(_ id: String, _ label: String, dark: (String, String)? = nil, light: (String, String)? = nil) -> CodexThemeItem {
        var out: [CodexThemeMode: CodexThemeVariant] = [:]
        if let dark {
            out[.dark] = CodexThemeVariant(name: dark.0, resource: dark.1)
        }
        if let light {
            out[.light] = CodexThemeVariant(name: light.0, resource: light.1)
        }
        return CodexThemeItem(id: id, label: label, registrationByVariant: out)
    }

    private static func load(resource: String) throws -> CodexRawTheme {
        guard let url = bundle().url(forResource: resource, withExtension: "json") else {
            throw CodexThemeError.missingResource(resource)
        }
        return try JSONDecoder().decode(CodexRawTheme.self, from: Data(contentsOf: url))
    }

    private static func bundle() -> Bundle {
        let env = ProcessInfo.processInfo.environment["PACKAGE_RESOURCE_BUNDLE_PATH"]
            ?? ProcessInfo.processInfo.environment["PACKAGE_RESOURCE_BUNDLE_URL"]
        let dirs = [
            env.map(URL.init(fileURLWithPath:)),
            Bundle.main.resourceURL,
            Bundle(for: Box.self).resourceURL,
            Bundle(for: Box.self).bundleURL.deletingLastPathComponent(),
            Bundle.main.bundleURL,
        ]
        for dir in dirs.compactMap({ $0 }) {
            if dir.pathExtension == "bundle", let bundle = Bundle(url: dir) {
                return bundle
            }
            let url = dir.appendingPathComponent(bundleName + ".bundle")
            if let bundle = Bundle(url: url) {
                return bundle
            }
        }
        if let bundle = Bundle(url: Bundle(for: Box.self).bundleURL) {
            return bundle
        }
        fatalError("unable to find bundle named \(bundleName)")
    }

    private final class Box {}

    private static func cleanFonts(_ fonts: CodexThemeFontsPatch?) -> CodexThemeFonts {
        CodexThemeFonts(
            code: cleanFont(fonts?.code),
            ui: cleanFont(fonts?.ui)
        )
    }

    private static func cleanSemantics(_ colors: CodexThemeSemanticColorsPatch?, fallback: CodexThemeSemanticColors) -> CodexThemeSemanticColors {
        CodexThemeSemanticColors(
            diffAdded: cleanHex(colors?.diffAdded) ?? fallback.diffAdded,
            diffRemoved: cleanHex(colors?.diffRemoved) ?? fallback.diffRemoved,
            skill: cleanHex(colors?.skill) ?? fallback.skill
        )
    }

    private static func cleanFont(_ value: String?) -> String? {
        let item = value?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return item.isEmpty ? nil : item
    }

    private static func clamp(_ value: Int?, fallback: Int) -> Int {
        guard let value else {
            return fallback
        }
        return min(100, max(0, value))
    }

    private static func context(_ theme: CodexThemeSeed, mode: CodexThemeMode) -> ThemeContext {
        let contrast = contrastOf(theme.contrast, mode: mode)
        let surface = rgb(theme.surface)
        let ink = rgb(theme.ink)
        let editor = mode == .light ? mix(surface, white, 0.12) : mix(surface, ink, 0.07)
        return ThemeContext(
            accent: rgb(theme.accent),
            contrast: contrast,
            editorBackground: editor,
            ink: ink,
            surface: surface,
            surfaceUnder: under(theme, surface: surface, ink: ink, mode: mode),
            theme: theme,
            variant: mode
        )
    }

    private static func vars(_ ctx: ThemeContext, _ colors: ChromeColors) -> [String: String] {
        [
            "--codex-base-accent": ctx.theme.accent,
            "--codex-base-contrast": "\(ctx.theme.contrast)",
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
            "--color-background-editor-opaque": rgbString(ctx.editorBackground),
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
            "--color-editor-added": rgba(rgb(ctx.theme.semanticColors.diffAdded), alpha: ctx.variant == .light ? 0.15 : 0.23),
            "--color-editor-deleted": rgba(rgb(ctx.theme.semanticColors.diffRemoved), alpha: ctx.variant == .light ? 0.15 : 0.23),
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
        ]
    }

    private static func light(_ ctx: ThemeContext) -> ChromeColors {
        let tone = mix(ctx.surface, white, 0.09 + ctx.contrast * 0.04)
        let rise = mix(ctx.surface, white, 0.08 + ctx.contrast * 0.08)
        let lift = mix(ctx.surface, white, 0.16 + ctx.contrast * 0.12)
        return ChromeColors(
            accentBackground: mixHex(ctx.surface, ctx.accent, 0.11 + ctx.contrast * 0.04),
            accentBackgroundActive: mixHex(ctx.surface, ctx.accent, 0.13 + ctx.contrast * 0.05),
            accentBackgroundHover: mixHex(ctx.surface, ctx.accent, 0.12 + ctx.contrast * 0.045),
            border: rgba(ctx.ink, alpha: 0.06 + ctx.contrast * 0.04),
            borderFocus: ctx.theme.accent,
            borderHeavy: rgba(ctx.ink, alpha: 0.09 + ctx.contrast * 0.06),
            borderLight: rgba(ctx.ink, alpha: 0.04 + ctx.contrast * 0.02),
            buttonPrimaryBackground: ctx.theme.ink,
            buttonPrimaryBackgroundActive: rgba(ctx.ink, alpha: 0.1 + ctx.contrast * 0.12),
            buttonPrimaryBackgroundHover: rgba(ctx.ink, alpha: 0.05 + ctx.contrast * 0.06),
            buttonPrimaryBackgroundInactive: rgba(ctx.ink, alpha: 0.18 + ctx.contrast * 0.14),
            buttonSecondaryBackground: rgba(ctx.ink, alpha: 0.04 + ctx.contrast * 0.02),
            buttonSecondaryBackgroundActive: rgba(ctx.ink, alpha: 0.03 + ctx.contrast * 0.02),
            buttonSecondaryBackgroundHover: rgba(ctx.ink, alpha: 0.05 + ctx.contrast * 0.04),
            buttonSecondaryBackgroundInactive: rgba(ctx.ink, alpha: 0.01 + ctx.contrast * 0.02),
            buttonTertiaryBackground: rgba(ctx.ink, alpha: 0),
            buttonTertiaryBackgroundActive: rgba(ctx.ink, alpha: 0.16 + ctx.contrast * 0.08),
            buttonTertiaryBackgroundHover: rgba(ctx.ink, alpha: 0.08 + ctx.contrast * 0.04),
            controlBackground: rgba(tone, alpha: 0.96),
            controlBackgroundOpaque: rgbString(tone),
            elevatedPrimary: rgba(lift, alpha: 0.96),
            elevatedPrimaryOpaque: rgbString(lift),
            elevatedSecondary: rgba(rise, alpha: 0.96),
            elevatedSecondaryOpaque: rgbString(rise),
            iconAccent: ctx.theme.accent,
            iconPrimary: ctx.theme.ink,
            iconSecondary: rgba(ctx.ink, alpha: 0.65 + ctx.contrast * 0.1),
            iconTertiary: rgba(ctx.ink, alpha: 0.45 + ctx.contrast * 0.1),
            simpleScrim: rgba(black, alpha: 0.08 + ctx.contrast * 0.04),
            textAccent: ctx.theme.accent,
            textButtonPrimary: ctx.theme.surface,
            textButtonSecondary: ctx.theme.ink,
            textButtonTertiary: rgba(ctx.ink, alpha: 0.45 + ctx.contrast * 0.1),
            textForeground: ctx.theme.ink,
            textForegroundSecondary: rgba(ctx.ink, alpha: 0.65 + ctx.contrast * 0.1),
            textForegroundTertiary: rgba(ctx.ink, alpha: 0.45 + ctx.contrast * 0.1)
        )
    }

    private static func dark(_ ctx: ThemeContext) -> ChromeColors {
        let tone = mix(ctx.surface, ctx.ink, 0.06 + ctx.contrast * 0.05)
        let ring = mix(ctx.accent, white, 0.3 + ctx.contrast * 0.15)
        let fill = mix(ctx.surface, black, 0.38 + ctx.contrast * 0.12)
        let lift = mix(ctx.surface, ctx.ink, 0.08 + ctx.contrast * 0.08)
        return ChromeColors(
            accentBackground: mixHex(black, ctx.accent, 0.2 + ctx.contrast * 0.08),
            accentBackgroundActive: mixHex(black, ctx.accent, 0.22 + ctx.contrast * 0.12),
            accentBackgroundHover: mixHex(black, ctx.accent, 0.21 + ctx.contrast * 0.1),
            border: rgba(ctx.ink, alpha: 0.06 + ctx.contrast * 0.04),
            borderFocus: rgba(ring, alpha: 0.7 + ctx.contrast * 0.1),
            borderHeavy: rgba(ctx.ink, alpha: 0.12 + ctx.contrast * 0.06),
            borderLight: rgba(ctx.ink, alpha: 0.03 + ctx.contrast * 0.02),
            buttonPrimaryBackground: rgbString(fill),
            buttonPrimaryBackgroundActive: rgba(ctx.ink, alpha: 0.07 + ctx.contrast * 0.05),
            buttonPrimaryBackgroundHover: rgba(ctx.ink, alpha: 0.04 + ctx.contrast * 0.03),
            buttonPrimaryBackgroundInactive: rgba(ctx.ink, alpha: 0.02 + ctx.contrast * 0.02),
            buttonSecondaryBackground: rgba(ctx.ink, alpha: 0.04 + ctx.contrast * 0.02),
            buttonSecondaryBackgroundActive: rgba(ctx.ink, alpha: 0.09 + ctx.contrast * 0.05),
            buttonSecondaryBackgroundHover: rgba(ctx.ink, alpha: 0.06 + ctx.contrast * 0.03),
            buttonSecondaryBackgroundInactive: rgba(ctx.ink, alpha: 0.02 + ctx.contrast * 0.03),
            buttonTertiaryBackground: rgba(ctx.ink, alpha: 0.02 + ctx.contrast * 0.015),
            buttonTertiaryBackgroundActive: rgba(ctx.ink, alpha: 0.07 + ctx.contrast * 0.05),
            buttonTertiaryBackgroundHover: rgba(ctx.ink, alpha: 0.05 + ctx.contrast * 0.03),
            controlBackground: rgba(tone, alpha: 0.96),
            controlBackgroundOpaque: rgbString(tone),
            elevatedPrimary: rgba(lift, alpha: 0.96),
            elevatedPrimaryOpaque: rgbString(lift),
            elevatedSecondary: rgba(ctx.ink, alpha: 0.02 + ctx.contrast * 0.02),
            elevatedSecondaryOpaque: mixHex(ctx.surface, ctx.ink, 0.04 + ctx.contrast * 0.05),
            iconAccent: rgbString(ring),
            iconPrimary: rgba(ctx.ink, alpha: 0.82 + ctx.contrast * 0.14),
            iconSecondary: rgba(ctx.ink, alpha: 0.65 + ctx.contrast * 0.1),
            iconTertiary: rgba(ctx.ink, alpha: 0.45 + ctx.contrast * 0.1),
            simpleScrim: rgba(ctx.ink, alpha: 0.08 + ctx.contrast * 0.04),
            textAccent: rgbString(ring),
            textButtonPrimary: rgbString(fill),
            textButtonSecondary: mixHex(ctx.ink, ctx.surface, 0.7 + ctx.contrast * 0.1),
            textButtonTertiary: rgba(ctx.ink, alpha: 0.45 + ctx.contrast * 0.1),
            textForeground: ctx.theme.ink,
            textForegroundSecondary: rgba(ctx.ink, alpha: 0.65 + ctx.contrast * 0.1),
            textForegroundTertiary: rgba(ctx.ink, alpha: 0.42 + ctx.contrast * 0.13)
        )
    }

    private static func mergeFonts(_ lhs: CodexThemeFontsPatch?, _ rhs: CodexThemeFontsPatch?) -> CodexThemeFontsPatch? {
        guard lhs != nil || rhs != nil else {
            return nil
        }
        return CodexThemeFontsPatch(
            code: rhs?.code ?? lhs?.code,
            ui: rhs?.ui ?? lhs?.ui
        )
    }

    private static func mergeSemantics(_ lhs: CodexThemeSemanticColorsPatch?, _ rhs: CodexThemeSemanticColorsPatch?) -> CodexThemeSemanticColorsPatch? {
        guard lhs != nil || rhs != nil else {
            return nil
        }
        return CodexThemeSemanticColorsPatch(
            diffAdded: rhs?.diffAdded ?? lhs?.diffAdded,
            diffRemoved: rhs?.diffRemoved ?? lhs?.diffRemoved,
            skill: rhs?.skill ?? lhs?.skill
        )
    }

    private static func firstColor(_ colors: [String: String]?, _ keys: [String]) -> String? {
        guard let colors else {
            return nil
        }
        for key in keys {
            if let value = cleanColor(colors[key]) {
                return value
            }
        }
        return nil
    }

    private static func inferAccent(_ raw: CodexRawTheme, surface: String, ink: String) -> String? {
        for key in accentKeys {
            if let value = cleanColor(raw.colors?[key], minimumAlpha: fillMin, minimumChromaticRange: popMin), !near(value, surface), !near(value, ink) {
                return value
            }
        }

        var best: String?
        var score = -Double.greatestFiniteMagnitude
        for tone in tones(raw) {
            guard let value = cleanColor(tone.settings?.foreground, minimumAlpha: fillMin, minimumChromaticRange: popMin), !near(value, surface), !near(value, ink) else {
                continue
            }
            let next = weight(value, surface: surface, ink: ink)
            if next > score {
                best = value
                score = next
            }
        }
        return best
    }

    private static func inferHue(_ raw: CodexRawTheme, surface: String, ink: String, range: Range, anchor: Double) -> String? {
        var best: String?
        var score = -Double.greatestFiniteMagnitude

        for value in candidates(raw) {
            guard !near(value, surface), !near(value, ink), let hex = hex(value), let hue = hue(hex), inRange(hue, range) else {
                continue
            }
            let next = weight(value, surface: surface, ink: ink) - hueDistance(hue, anchor) * 2
            if next > score {
                best = value
                score = next
            }
        }

        return best
    }

    private static func candidates(_ raw: CodexRawTheme) -> [String] {
        let colors = raw.colors?.values.map { $0 } ?? []
        let tones = tones(raw).compactMap { $0.settings?.foreground }
        return unique((colors + tones).compactMap { cleanColor($0, minimumAlpha: fillMin, minimumChromaticRange: popMin) })
    }

    private static func tones(_ raw: CodexRawTheme) -> [CodexTone] {
        (raw.tokenColors ?? []) + (raw.settings ?? [])
    }

    private static func cleanHex(_ value: String?) -> String? {
        guard let value else {
            return nil
        }
        let item = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard item.count == 7, item.first == "#" else {
            return nil
        }
        let body = item.dropFirst()
        guard body.allSatisfy({ $0.isHexDigit }) else {
            return nil
        }
        return item.lowercased()
    }

    private static func cleanColor(_ value: String?, minimumAlpha: Double = 0.98, minimumChromaticRange: Double = 0) -> String? {
        guard let hex = hex(value), hex.alpha >= minimumAlpha, chroma(hex) >= minimumChromaticRange else {
            return nil
        }
        return hexString(hex)
    }

    private static func hex(_ value: String?) -> Hex? {
        guard let value else {
            return nil
        }
        let item = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard item.first == "#" else {
            return nil
        }
        let body = String(item.dropFirst())
        guard body.count == 6 || body.count == 8 else {
            return nil
        }
        guard body.allSatisfy({ $0.isHexDigit }) else {
            return nil
        }
        let red = Int(body.prefix(2), radix: 16) ?? 0
        let green = Int(body.dropFirst(2).prefix(2), radix: 16) ?? 0
        let blue = Int(body.dropFirst(4).prefix(2), radix: 16) ?? 0
        let alpha = body.count == 8 ? Double(Int(body.suffix(2), radix: 16) ?? 255) / 255.0 : 1
        return Hex(red: red, green: green, blue: blue, alpha: alpha)
    }

    private static func rgb(_ value: String) -> RGB {
        let hex = hex(value) ?? Hex(red: 0, green: 0, blue: 0, alpha: 1)
        return RGB(red: hex.red, green: hex.green, blue: hex.blue)
    }

    private static func chroma(_ value: Hex) -> Double {
        Double(max(value.red, value.green, value.blue) - min(value.red, value.green, value.blue))
    }

    private static func near(_ lhs: String, _ rhs: String) -> Bool {
        guard let lhs = hex(lhs), let rhs = hex(rhs) else {
            return false
        }
        return distance(lhs, rhs) < 42
    }

    private static func weight(_ value: String, surface: String, ink: String) -> Double {
        guard let value = hex(value), let surface = hex(surface), let ink = hex(ink) else {
            return 0
        }
        return chroma(value) + distance(value, surface) / 4 + distance(value, ink) / 4
    }

    private static func distance(_ lhs: Hex, _ rhs: Hex) -> Double {
        let red = Double(lhs.red - rhs.red)
        let green = Double(lhs.green - rhs.green)
        let blue = Double(lhs.blue - rhs.blue)
        return (red * red + green * green + blue * blue).squareRoot()
    }

    private static func hue(_ color: Hex) -> Double? {
        let red = Double(color.red) / 255
        let green = Double(color.green) / 255
        let blue = Double(color.blue) / 255
        let high = max(red, green, blue)
        let delta = high - min(red, green, blue)
        guard delta != 0 else {
            return nil
        }
        let hue: Double
        if high == red {
            hue = ((green - blue) / delta).truncatingRemainder(dividingBy: 6) * 60
        } else if high == green {
            hue = (((blue - red) / delta) + 2) * 60
        } else {
            hue = (((red - green) / delta) + 4) * 60
        }
        return (hue + 360).truncatingRemainder(dividingBy: 360)
    }

    private static func inRange(_ hue: Double, _ range: Range) -> Bool {
        if range.min <= range.max {
            return hue >= range.min && hue <= range.max
        }
        return hue >= range.min || hue <= range.max
    }

    private static func hueDistance(_ lhs: Double, _ rhs: Double) -> Double {
        let delta = abs(lhs - rhs)
        return min(delta, 360 - delta)
    }

    private static func contrastOf(_ value: Int, mode: CodexThemeMode) -> Double {
        let ref = Double(anchor[mode] ?? value)
        let ratio = ref / 100
        let scaled = Double(value) / 100 + Double(value - Int(ref)) / 60 * gain
        if Double(value) <= ref {
            return scaled
        }
        return ratio + (scaled - ratio) * lift
    }

    private static func under(_ theme: CodexThemeSeed, surface: RGB, ink: RGB, mode: CodexThemeMode) -> String {
        let ref = Double(anchor[mode] ?? theme.contrast)
        let amount = (shadow[mode] ?? 0) + (Double(theme.contrast) - ref) * (sink[mode] ?? 0)
        if mode == .light {
            return mixHex(surface, ink, amount)
        }
        return mixHex(surface, black, amount)
    }

    private static func panelOf(_ ctx: ThemeContext) -> String {
        let target = ctx.variant == .light ? white : ctx.ink
        return mixHex(ctx.surface, target, (panel[ctx.variant] ?? 0) + ctx.contrast * (haze[ctx.variant] ?? 0))
    }

    private static func mixHex(_ lhs: RGB, _ rhs: RGB, _ amount: Double) -> String {
        hexString(mix(lhs, rhs, amount))
    }

    private static func mixHex(_ lhs: String, _ rhs: String, _ amount: Double) -> String {
        mixHex(rgb(lhs), rgb(rhs), amount)
    }

    private static func mix(_ lhs: RGB, _ rhs: RGB, _ amount: Double) -> RGB {
        let value = max(0, min(1, amount))
        return RGB(
            red: blend(lhs.red, rhs.red, value),
            green: blend(lhs.green, rhs.green, value),
            blue: blend(lhs.blue, rhs.blue, value)
        )
    }

    private static func blend(_ lhs: Int, _ rhs: Int, _ amount: Double) -> Int {
        Int((Double(lhs) + (Double(rhs - lhs) * amount)).rounded())
    }

    private static func rgba(_ color: RGB, alpha: Double) -> String {
        let value = max(0, min(1, alpha))
        return "rgba(\(color.red), \(color.green), \(color.blue), \(alphaString(value)))"
    }

    private static func rgbString(_ color: RGB) -> String {
        "rgb(\(color.red), \(color.green), \(color.blue))"
    }

    private static func alphaString(_ value: Double) -> String {
        var text = String(format: "%.3f", value)
        while text.last == "0" {
            text.removeLast()
        }
        if text.last == "." {
            text.removeLast()
        }
        return text
    }

    private static func hexString(_ color: Hex) -> String {
        "#\(byte(color.red))\(byte(color.green))\(byte(color.blue))"
    }

    private static func hexString(_ color: RGB) -> String {
        "#\(byte(color.red))\(byte(color.green))\(byte(color.blue))"
    }

    private static func byte(_ value: Int) -> String {
        String(format: "%02x", value)
    }

    private static func unique(_ values: [String]) -> [String] {
        var seen = Set<String>()
        var out: [String] = []
        for value in values where seen.insert(value).inserted {
            out.append(value)
        }
        return out
    }
}
