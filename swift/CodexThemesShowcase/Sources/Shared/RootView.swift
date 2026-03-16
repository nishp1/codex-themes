import CodexThemesKit
import SwiftUI

struct RootView: View {
    @State private var mode: CodexThemeMode = .dark
    @State private var selected: String? = "linear"
    @State private var query = ""
    @State private var level: Double?

    private var list: [CodexThemeItem] {
        let items = CodexThemes.availableThemes(mode)
        if query.isEmpty {
            return items
        }
        return items.filter {
            $0.id.localizedCaseInsensitiveContains(query) ||
            $0.label.localizedCaseInsensitiveContains(query)
        }
    }

    private var active: String {
        if let selected, list.contains(where: { $0.id == selected }) {
            return selected
        }
        return list.first?.id ?? CodexThemes.pickTheme("codex", mode: mode).id
    }

    private var theme: CodexResolvedTheme? {
        try? CodexThemes.resolvedTheme(active, mode: mode, chrome: patch)
    }

    private var base: CodexResolvedTheme? {
        try? CodexThemes.resolvedTheme(active, mode: mode)
    }

    private var patch: CodexThemePatch? {
        guard let level else {
            return nil
        }
        return CodexThemePatch(contrast: Int(level.rounded()))
    }

    private var item: CodexThemeItem? {
        list.first(where: { $0.id == active }) ?? CodexThemes.availableThemes(mode).first(where: { $0.id == active })
    }

    private var fill: Color {
        guard let theme else {
            #if os(macOS)
            return Color(nsColor: .windowBackgroundColor)
            #else
            return Color(uiColor: .systemBackground)
            #endif
        }
        return theme.palette.color("--color-background-surface-under", fallback: theme.seed.surface)
    }

    private var top: CGFloat {
        #if os(macOS)
        return 56
        #else
        return 0
        #endif
    }

    var body: some View {
        NavigationSplitView {
            List(selection: $selected) {
                ForEach(list, id: \.id) { item in
                    ThemeRow(
                        current: active == item.id,
                        item: item,
                        mode: mode
                    )
                    .tag(item.id)
                }
            }
            .listStyle(.sidebar)
            .searchable(text: $query, prompt: "Search themes")
            .safeAreaPadding(.top, top)
            .onChange(of: mode) { _, _ in
                if !list.contains(where: { $0.id == selected }) {
                    selected = list.first?.id
                }
            }
        } detail: {
            if let theme {
                DetailView(
                    theme: theme,
                    mode: mode,
                    base: base?.seed.contrast ?? theme.seed.contrast,
                    level: $level
                )
            } else {
                ContentUnavailableView("Theme Missing", systemImage: "paintpalette")
            }
        }
        .navigationSplitViewStyle(.balanced)
        .background(fill.ignoresSafeArea())
        #if os(macOS)
        .toolbarRole(.editor)
        .toolbar {
            ToolbarItem(placement: .navigation) {
                Title(item: item)
            }
            ToolbarItem(placement: .principal) {
                Picker("Mode", selection: $mode) {
                    ForEach(CodexThemeMode.allCases, id: \.self) { item in
                        Text(item.label).tag(item)
                    }
                }
                .pickerStyle(.segmented)
                .frame(width: 180)
            }
        }
        .toolbarBackgroundVisibility(.hidden, for: .windowToolbar)
        .background(Chrome())
        #endif
    }
}

private struct ThemeRow: View {
    let current: Bool
    let item: CodexThemeItem
    let mode: CodexThemeMode

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(current ? Color.accentColor : Color.secondary.opacity(0.2))
                .frame(width: 10, height: 10)
            VStack(alignment: .leading, spacing: 2) {
                Text(item.label)
                    .font(.body.weight(.medium))
                Text(item.id)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(mode.label)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

private struct DetailView: View {
    let theme: CodexResolvedTheme
    let mode: CodexThemeMode
    let base: Int
    @Binding var level: Double?

    private var palette: CodexThemePalette {
        theme.palette
    }

    private let keys = [
        "--color-background-surface",
        "--color-background-panel",
        "--color-background-control",
        "--color-background-accent",
        "--color-border",
        "--color-border-focus",
        "--color-text-foreground",
        "--color-text-foreground-secondary",
        "--color-decoration-added",
        "--color-decoration-deleted",
    ]

    private var top: CGFloat {
        #if os(macOS)
        return 88
        #else
        return 24
        #endif
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header
                contrast
                CodexThemePreview(theme: theme)
                tokenGrid
                meta
            }
            .padding(.top, top)
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
            .frame(maxWidth: 1200, alignment: .leading)
        }
        .background(palette.color("--color-background-surface-under", fallback: theme.seed.surface))
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(theme.raw.displayName ?? theme.raw.name)
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(palette.color("--color-text-foreground", fallback: theme.seed.ink))
            Text("SwiftUI host app using the local CodexThemesKit package.")
                .font(.body)
                .foregroundStyle(palette.color("--color-text-foreground-secondary", fallback: theme.seed.ink))
            HStack(spacing: 12) {
                badge(theme.item.id)
                badge(mode.label)
                badge("contrast \(theme.seed.contrast)")
                if level != nil {
                    badge("default \(base)")
                }
            }
        }
    }

    private var contrast: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Text("Contrast")
                    .font(.headline)
                    .foregroundStyle(palette.color("--color-text-foreground", fallback: theme.seed.ink))
                Spacer()
                Text(level == nil ? "Default \(base)" : "\(theme.seed.contrast)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(palette.color("--color-text-foreground-secondary", fallback: theme.seed.ink))
                Button(level == nil ? "Using Default" : "Reset") {
                    level = nil
                }
                .buttonStyle(.plain)
                .foregroundStyle(palette.color("--color-text-accent", fallback: theme.seed.accent))
                .opacity(level == nil ? 0.55 : 1)
                .disabled(level == nil)
            }
            Slider(
                value: Binding(
                    get: { level ?? Double(base) },
                    set: { level = $0.rounded() }
                ),
                in: 0...100,
                step: 1
            )
            .tint(palette.color("--color-text-accent", fallback: theme.seed.accent))
        }
        .padding(18)
        .frame(maxWidth: 420, alignment: .leading)
        .background(palette.color("--color-background-panel", fallback: theme.seed.surface))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(palette.color("--color-border-light", fallback: theme.seed.ink), lineWidth: 1)
        }
    }

    private var tokenGrid: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Core Tokens")
                .font(.headline)
                .foregroundStyle(palette.color("--color-text-foreground", fallback: theme.seed.ink))
            LazyVGrid(columns: [.init(.adaptive(minimum: 220), spacing: 12)], spacing: 12) {
                ForEach(keys, id: \.self) { key in
                    TokenTile(
                        key: key,
                        value: theme.tokens[key] ?? "",
                        fill: palette.color(key, fallback: theme.seed.surface),
                        text: palette.color("--color-text-foreground", fallback: theme.seed.ink)
                    )
                }
            }
        }
    }

    private var meta: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Theme Seed")
                .font(.headline)
                .foregroundStyle(palette.color("--color-text-foreground", fallback: theme.seed.ink))
            Grid(alignment: .leading, horizontalSpacing: 16, verticalSpacing: 10) {
                row("accent", theme.seed.accent)
                row("surface", theme.seed.surface)
                row("ink", theme.seed.ink)
                row("ui font", theme.seed.fonts.ui ?? "system")
                row("code font", theme.seed.fonts.code ?? "system monospaced")
                row("opaque windows", theme.seed.opaqueWindows ? "true" : "false")
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(palette.color("--color-background-panel", fallback: theme.seed.surface))
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
    }

    private func row(_ key: String, _ value: String) -> some View {
        GridRow {
            Text(key)
                .foregroundStyle(palette.color("--color-text-foreground-secondary", fallback: theme.seed.ink))
            Text(value)
                .textSelection(.enabled)
                .foregroundStyle(palette.color("--color-text-foreground", fallback: theme.seed.ink))
        }
    }

    private func badge(_ value: String) -> some View {
        Text(value)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(palette.color("--color-background-control", fallback: theme.seed.surface))
            .foregroundStyle(palette.color("--color-text-foreground-secondary", fallback: theme.seed.ink))
            .clipShape(Capsule())
    }
}

private struct Title: View {
    let item: CodexThemeItem?

    var body: some View {
        HStack(spacing: 12) {
            Text("Codex Themes")
                .font(.title3.weight(.semibold))
            if let item {
                Text(item.label)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
        }
        .lineLimit(1)
    }
}

private struct TokenTile: View {
    let key: String
    let value: String
    let fill: Color
    let text: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(fill)
                .frame(height: 56)
                .overlay {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(text.opacity(0.08), lineWidth: 1)
                }
            Text(key)
                .font(.caption.weight(.semibold))
            Text(value)
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(.secondary)
                .textSelection(.enabled)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.primary.opacity(0.04))
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

private extension CodexThemeMode {
    var label: String {
        rawValue.capitalized
    }
}
