#if canImport(SwiftUI)
import SwiftUI

public struct CodexThemePalette {
    public let seed: CodexThemeSeed
    public let tokens: [String: String]

    public init(seed: CodexThemeSeed, tokens: [String: String]) {
        self.seed = seed
        self.tokens = tokens
    }

    public func color(_ name: String, fallback: String = "#000000") -> Color {
        Color(css: tokens[name] ?? fallback) ?? Color(css: fallback) ?? .black
    }
}

public extension CodexResolvedTheme {
    var palette: CodexThemePalette {
        CodexThemePalette(seed: seed, tokens: tokens)
    }
}

public struct CodexThemePreview: View {
    public let theme: CodexResolvedTheme

    public init(theme: CodexResolvedTheme) {
        self.theme = theme
    }

    public var body: some View {
        let palette = theme.palette

        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text(theme.item.label)
                    .font(.title2.weight(.semibold))
                Text(theme.raw.displayName ?? theme.raw.name)
                    .font(.subheadline)
                    .foregroundStyle(palette.color("--color-text-foreground-secondary", fallback: theme.seed.ink))
            }

            HStack(spacing: 12) {
                chip("Surface", palette.color("--color-background-surface", fallback: theme.seed.surface), text: palette.color("--color-text-foreground", fallback: theme.seed.ink))
                chip("Panel", palette.color("--color-background-panel", fallback: theme.seed.surface), text: palette.color("--color-text-foreground", fallback: theme.seed.ink))
                chip("Accent", palette.color("--color-background-accent", fallback: theme.seed.accent), text: palette.color("--color-text-accent", fallback: theme.seed.accent))
            }

            HStack(spacing: 12) {
                button("Primary", fill: palette.color("--color-background-button-primary", fallback: theme.seed.ink), text: palette.color("--color-text-button-primary", fallback: theme.seed.surface))
                button("Secondary", fill: palette.color("--color-background-button-secondary", fallback: theme.seed.surface), text: palette.color("--color-text-button-secondary", fallback: theme.seed.ink))
                button("Tertiary", fill: palette.color("--color-background-button-tertiary", fallback: theme.seed.surface), text: palette.color("--color-text-button-tertiary", fallback: theme.seed.ink))
            }

            VStack(alignment: .leading, spacing: 10) {
                Text("Terminal")
                    .font(.headline)
                    .foregroundStyle(palette.color("--color-text-foreground", fallback: theme.seed.ink))

                VStack(alignment: .leading, spacing: 6) {
                    Text("$ bun run dev")
                        .foregroundStyle(Color(css: theme.seed.accent) ?? .blue)
                    Text("vite ready in 126ms")
                        .foregroundStyle(palette.color("--color-text-foreground-secondary", fallback: theme.seed.ink))
                    Text("ansi red green yellow blue magenta cyan")
                        .foregroundStyle(palette.color("--color-text-foreground", fallback: theme.seed.ink))
                    terminalSwatches(palette)
                }
                .font(.system(.footnote, design: .monospaced))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(14)
                .background(palette.color("--color-background-panel", fallback: theme.seed.surface))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(palette.color("--color-border-light", fallback: theme.seed.ink).opacity(0.6), lineWidth: 1)
                }
            }
        }
        .padding(20)
        .background(palette.color("--color-background-surface-under", fallback: theme.seed.surface))
        .foregroundStyle(palette.color("--color-text-foreground", fallback: theme.seed.ink))
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func terminalSwatches(_ palette: CodexThemePalette) -> some View {
        HStack(spacing: 8) {
            ForEach(swatches, id: \.0) { item in
                Circle()
                    .fill(palette.color(item.1))
                    .frame(width: 10, height: 10)
            }
        }
    }

    private func chip(_ name: String, _ fill: Color, text: Color) -> some View {
        Text(name)
            .font(.system(.caption, design: .rounded).weight(.semibold))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(fill)
            .foregroundStyle(text)
            .clipShape(Capsule())
    }

    private func button(_ name: String, fill: Color, text: Color) -> some View {
        Text(name)
            .font(.system(.subheadline, design: .rounded).weight(.medium))
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .background(fill)
            .foregroundStyle(text)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private let swatches = [
        ("red", "--color-decoration-deleted"),
        ("green", "--color-decoration-added"),
        ("yellow", "--color-background-accent"),
        ("blue", "--color-accent-blue"),
        ("magenta", "--color-accent-purple"),
        ("ink", "--color-text-foreground"),
    ]
}

private extension Color {
    init?(css: String) {
        let item = css.trimmingCharacters(in: .whitespacesAndNewlines)
        if item.hasPrefix("#"), let color = Self.hex(item) {
            self = color
            return
        }
        if item.hasPrefix("rgba("), let color = Self.rgba(item) {
            self = color
            return
        }
        if item.hasPrefix("rgb("), let color = Self.rgb(item) {
            self = color
            return
        }
        return nil
    }

    static func hex(_ value: String) -> Color? {
        let body = value.dropFirst()
        guard body.count == 6, body.allSatisfy(\.isHexDigit) else {
            return nil
        }
        let red = Double(Int(body.prefix(2), radix: 16) ?? 0) / 255
        let green = Double(Int(body.dropFirst(2).prefix(2), radix: 16) ?? 0) / 255
        let blue = Double(Int(body.dropFirst(4).prefix(2), radix: 16) ?? 0) / 255
        return Color(.sRGB, red: red, green: green, blue: blue, opacity: 1)
    }

    static func rgb(_ value: String) -> Color? {
        let body = value.dropFirst(4).dropLast()
        let parts = body.split(separator: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        guard parts.count == 3 else {
            return nil
        }
        let red = Double(parts[0]).map { $0 / 255 } ?? 0
        let green = Double(parts[1]).map { $0 / 255 } ?? 0
        let blue = Double(parts[2]).map { $0 / 255 } ?? 0
        return Color(.sRGB, red: red, green: green, blue: blue, opacity: 1)
    }

    static func rgba(_ value: String) -> Color? {
        let body = value.dropFirst(5).dropLast()
        let parts = body.split(separator: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        guard parts.count == 4 else {
            return nil
        }
        let red = Double(parts[0]).map { $0 / 255 } ?? 0
        let green = Double(parts[1]).map { $0 / 255 } ?? 0
        let blue = Double(parts[2]).map { $0 / 255 } ?? 0
        let opacity = Double(parts[3]) ?? 1
        return Color(.sRGB, red: red, green: green, blue: blue, opacity: opacity)
    }
}
#endif
