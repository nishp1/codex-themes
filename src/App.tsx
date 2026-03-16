import "./App.css";
import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef, useState } from "react";
import type { Service } from "./codex";
import { useTheme } from "./codex";

type Variant = "dark" | "light";

const keys = [
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
] as const;

function pick(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function read(name: string, fallback: string) {
  return pick(name) || fallback;
}

function label(value: string | null, code = false) {
  if (value && value.length > 0) return value;
  return code ? "system monospaced" : "system";
}

function theme() {
  return {
    background: pick("--vscode-terminal-background"),
    black: pick("--vscode-terminal-ansiBlack"),
    blue: pick("--vscode-terminal-ansiBlue"),
    brightBlack: pick("--vscode-terminal-ansiBrightBlack"),
    brightBlue: pick("--vscode-terminal-ansiBrightBlue"),
    brightCyan: pick("--vscode-terminal-ansiBrightCyan"),
    brightGreen: pick("--vscode-terminal-ansiBrightGreen"),
    brightMagenta: pick("--vscode-terminal-ansiBrightMagenta"),
    brightRed: pick("--vscode-terminal-ansiBrightRed"),
    brightWhite: pick("--vscode-terminal-ansiBrightWhite"),
    brightYellow: pick("--vscode-terminal-ansiBrightYellow"),
    cursor: pick("--color-text-accent"),
    cyan: pick("--vscode-terminal-ansiCyan"),
    foreground: pick("--vscode-terminal-foreground"),
    green: pick("--vscode-terminal-ansiGreen"),
    magenta: pick("--vscode-terminal-ansiMagenta"),
    red: pick("--vscode-terminal-ansiRed"),
    selectionBackground: pick("--vscode-terminal-selectionBackground"),
    white: pick("--vscode-terminal-ansiWhite"),
    yellow: pick("--vscode-terminal-ansiYellow"),
  };
}

function demo(term: Terminal, mode: Variant, code: string, surface: string) {
  term.write("\x1b[2J\x1b[H");
  term.writeln("\x1b[1;36mCodex xterm preview\x1b[0m");
  term.writeln(`\x1b[90mscheme\x1b[0m ${mode}  \x1b[90mtheme\x1b[0m ${code}`);
  term.writeln(`\x1b[90msurface\x1b[0m ${surface}`);
  term.writeln("");
  term.writeln("\x1b[1;32m$\x1b[0m bun run dev");
  term.writeln("\x1b[90m>\x1b[0m vite ready in \x1b[1;33m126ms\x1b[0m");
  term.writeln("\x1b[90m>\x1b[0m watching for theme changes");
  term.writeln("");
  term.writeln(
    "\x1b[1;34mANSI\x1b[0m \x1b[31mred\x1b[0m \x1b[32mgreen\x1b[0m \x1b[33myellow\x1b[0m \x1b[34mblue\x1b[0m \x1b[35mmagenta\x1b[0m \x1b[36mcyan\x1b[0m",
  );
  term.writeln(
    "\x1b[90mbright\x1b[0m \x1b[91mred\x1b[0m \x1b[92mgreen\x1b[0m \x1b[93myellow\x1b[0m \x1b[94mblue\x1b[0m \x1b[95mmagenta\x1b[0m \x1b[96mcyan\x1b[0m",
  );
  term.writeln("");
  term.writeln("\x1b[90m~/dev/Codex-Themes\x1b[0m");
}

function Xterm(props: {
  code: string;
  mode: Variant;
  ready: boolean;
  surface: string;
}) {
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = box.current;
    if (!node || !props.ready) return;
    const fit = new FitAddon();
    const term = new Terminal({
      allowTransparency: true,
      convertEol: true,
      cursorBlink: true,
      cursorStyle: "bar",
      disableStdin: true,
      fontFamily: pick("--font-code") || "ui-monospace, monospace",
      fontSize: 12,
      lineHeight: 1.35,
      rows: 10,
      scrollback: 0,
      theme: theme(),
    });

    term.loadAddon(fit);
    term.open(node);
    fit.fit();
    demo(term, props.mode, props.code, props.surface);

    // const resize = () => fit.fit();
    // const watch = new ResizeObserver(resize);
    // watch.observe(node);
    // window.addEventListener("resize", resize)

    return () => {
      // watch.disconnect()
      // window.removeEventListener("resize", resize)
      // term.dispose()
    };
  }, [props.code, props.mode, props.ready, props.surface]);

  return (
    <div
      className={props.ready ? "xterm-shell" : "xterm-shell is-loading"}
      ref={box}
    />
  );
}

function paint(
  theme: Service,
  key: "accent" | "ink" | "surface",
  value: string,
) {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
  theme.setThemePatch({ [key]: value });
}

function font(theme: Service, key: "code" | "ui", value: string) {
  theme.setFontsPatch({ [key]: value.length > 0 ? value : null });
}

function App() {
  const ctx = useTheme();
  const [copy, setCopy] = useState<Variant | null>(null);
  const [text, setText] = useState<Record<Variant, string>>({
    dark: "",
    light: "",
  });
  const core = keys.map((key) => ({
    key,
    value: read(
      key,
      key.includes("added")
        ? ctx.active.theme.semanticColors.diffAdded
        : key.includes("deleted")
          ? ctx.active.theme.semanticColors.diffRemoved
          : key.includes("accent")
            ? ctx.active.theme.accent
            : key.includes("foreground")
              ? ctx.active.theme.ink
              : ctx.active.theme.surface,
    ),
  }));
  const seed = [
    ["accent", ctx.active.theme.accent],
    ["surface", ctx.active.theme.surface],
    ["ink", ctx.active.theme.ink],
    ["ui font", label(ctx.active.theme.fonts.ui)],
    ["code font", label(ctx.active.theme.fonts.code, true)],
    ["opaque windows", String(ctx.active.theme.opaqueWindows)],
  ] as const;

  const panel = (variant: Variant, theme: Service) => (
    <article className="variant-card" key={variant}>
      <header className="variant-head">
        <div>
          <p className="eyebrow">
            {variant === "light" ? "Light Theme" : "Dark Theme"}
          </p>
          <h2>{theme.selectedCodeTheme.label}</h2>
        </div>
        <div className="head-actions">
          <button
            className="ghost-btn"
            disabled={theme.isDisabled}
            onClick={async () => {
              await navigator.clipboard
                .writeText(theme.exportThemeString())
                .catch(() => undefined);
              setCopy(variant);
              window.setTimeout(
                () => setCopy((value) => (value === variant ? null : value)),
                1200,
              );
            }}
          >
            {copy === variant ? "Copied" : "Copy Theme"}
          </button>
        </div>
      </header>

      <label className="field">
        <span className="label">Code Theme</span>
        <select
          className="select"
          disabled={theme.isDisabled}
          onChange={(evt) => {
            void theme.setCodeThemeId(evt.target.value);
          }}
          value={theme.selectedCodeTheme.id}
        >
          {theme.codeThemes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <div className="field-grid">
        {(["surface", "accent", "ink"] as const).map((item) => (
          <label className="field" key={item}>
            <span className="label">
              {item === "surface"
                ? "Background"
                : item === "ink"
                  ? "Foreground"
                  : "Accent"}
            </span>
            <div className="color-row">
              <input
                aria-label={`${variant} ${item}`}
                className="picker"
                disabled={theme.isDisabled}
                onChange={(evt) => paint(theme, item, evt.target.value)}
                type="color"
                value={theme.theme[item]}
              />
              <input
                className="text"
                disabled={theme.isDisabled}
                defaultValue={theme.theme[item]}
                key={`${variant}-${item}-${theme.theme[item]}`}
                onBlur={(evt) => paint(theme, item, evt.target.value.trim())}
                onKeyDown={(evt) => {
                  if (evt.key !== "Enter") return;
                  evt.preventDefault();
                  paint(theme, item, evt.currentTarget.value.trim());
                }}
                spellCheck={false}
                type="text"
              />
            </div>
          </label>
        ))}
      </div>

      <div className="field-grid">
        {(["ui", "code"] as const).map((item) => (
          <label className="field" key={item}>
            <span className="label">
              {item === "ui" ? "UI Font" : "Code Font"}
            </span>
            <input
              className="text"
              disabled={theme.isDisabled}
              key={`${variant}-${item}-${theme.fonts[item] ?? ""}`}
              onBlur={(evt) => font(theme, item, evt.target.value.trim())}
              onKeyDown={(evt) => {
                if (evt.key !== "Enter") return;
                evt.preventDefault();
                font(theme, item, evt.currentTarget.value.trim());
              }}
              placeholder={
                item === "ui"
                  ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                  : 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace'
              }
              spellCheck={false}
              type="text"
              defaultValue={theme.fonts[item] ?? ""}
            />
          </label>
        ))}
      </div>

      <label className="field">
        <span className="label">Contrast</span>
        <div className="range-row">
          <input
            aria-label={`${variant} contrast`}
            className="range"
            disabled={theme.isDisabled}
            max={100}
            min={0}
            onChange={(evt) =>
              theme.setThemePatch({ contrast: Number(evt.target.value) })
            }
            type="range"
            value={theme.theme.contrast}
          />
          <span className="range-value">{theme.theme.contrast}</span>
        </div>
      </label>

      <label className="toggle">
        <span>
          <strong>Translucent Sidebar</strong>
          <small>Matches the app’s inverse `opaqueWindows` setting.</small>
        </span>
        <input
          checked={!theme.theme.opaqueWindows}
          disabled={theme.isDisabled}
          onChange={(evt) =>
            theme.setThemePatch({ opaqueWindows: !evt.target.checked })
          }
          type="checkbox"
        />
      </label>

      <label className="field">
        <span className="label">Import Theme</span>
        <div className="import-row">
          <input
            className="text"
            onChange={(evt) =>
              setText((value) => ({ ...value, [variant]: evt.target.value }))
            }
            placeholder={theme.exportThemeString()}
            spellCheck={false}
            type="text"
            value={text[variant]}
          />
          <button
            className="ghost-btn"
            disabled={
              theme.isDisabled || !theme.canImportThemeString(text[variant])
            }
            onClick={() => {
              void theme.importThemeString(text[variant]).then(() => {
                setText((value) => ({ ...value, [variant]: "" }));
              });
            }}
          >
            Import
          </button>
        </div>
      </label>
    </article>
  );

  return (
    <main className="settings-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Codex Appearance</p>
          <h1>Theme Demo</h1>
          <p className="muted">
            This demo now follows Codex’s actual theme model: `appearanceTheme`,
            split light/dark code theme ids, split light/dark chrome themes, and
            the same share-string format used by the app.
          </p>
        </div>

        <div className="scheme-card">
          <span className="label">Theme</span>
          <div className="seg">
            {(["system", "light", "dark"] as const).map((item) => (
              <button
                className={ctx.scheme === item ? "seg-btn is-on" : "seg-btn"}
                key={item}
                onClick={() => ctx.setScheme(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="stats">
            <div>
              <span>Resolved</span>
              <strong>{ctx.mode}</strong>
            </div>
            <div>
              <span>Active Theme</span>
              <strong>{ctx.active.selectedCodeTheme.label}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{ctx.ready ? "ready" : "loading"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="preview-grid">
        <article className="preview-card">
          <div className="card-head">
            <h3>Chrome Preview</h3>
            <span className="pill">{ctx.active.selectedCodeTheme.id}</span>
          </div>
          <div className="chips">
            <span className="chip bg">surface</span>
            <span className="chip panel">panel</span>
            <span className="chip control">control</span>
            <span className="chip accent">accent</span>
          </div>
          <div className="button-row">
            <button className="pri">Primary</button>
            <button className="sec">Secondary</button>
            <button className="ter">Tertiary</button>
          </div>
        </article>

        <article className="preview-card">
          <div className="card-head">
            <h3>Terminal</h3>
            <span className="pill">{ctx.mode}</span>
          </div>
          <Xterm
            code={ctx.active.selectedCodeTheme.id}
            mode={ctx.mode}
            ready={ctx.ready}
            surface={ctx.active.theme.surface}
          />
        </article>
      </section>

      <section className="variant-grid">
        {panel("light", ctx.light)}
        {panel("dark", ctx.dark)}
      </section>

      <section className="detail-card">
        <div className="detail-head">
          <div>
            <h3>Core Tokens</h3>
            <p className="muted">
              Live tokens resolved from the active {ctx.mode} theme.
            </p>
          </div>
          <span className="pill">{ctx.active.selectedCodeTheme.label}</span>
        </div>

        <div className="token-grid">
          {core.map((item) => (
            <article className="token-tile" key={item.key}>
              <div
                className="token-swatch"
                style={{ background: item.value }}
              />
              <strong>{item.key}</strong>
              <code>{item.value}</code>
            </article>
          ))}
        </div>

        <div className="seed-block">
          <h3>Theme Seed</h3>
          <div className="seed-card">
            {seed.map((item) => (
              <div className="seed-row" key={item[0]}>
                <span>{item[0]}</span>
                <strong>{item[1]}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
