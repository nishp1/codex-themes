import "./App.css"
import { useState } from "react"
import type { Service } from "./codex"
import { useTheme } from "./codex"

type Variant = "dark" | "light"

function paint(theme: Service, key: "accent" | "ink" | "surface", value: string) {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return
  theme.setThemePatch({ [key]: value })
}

function font(theme: Service, key: "code" | "ui", value: string) {
  theme.setFontsPatch({ [key]: value.length > 0 ? value : null })
}

function App() {
  const ctx = useTheme()
  const [copy, setCopy] = useState<Variant | null>(null)
  const [text, setText] = useState<Record<Variant, string>>({ dark: "", light: "" })

  const panel = (variant: Variant, theme: Service) => (
    <article className="variant-card" key={variant}>
      <header className="variant-head">
        <div>
          <p className="eyebrow">{variant === "light" ? "Light Theme" : "Dark Theme"}</p>
          <h2>{theme.selectedCodeTheme.label}</h2>
        </div>
        <div className="head-actions">
          <button
            className="ghost-btn"
            disabled={theme.isDisabled}
            onClick={async () => {
              await navigator.clipboard.writeText(theme.exportThemeString()).catch(() => undefined)
              setCopy(variant)
              window.setTimeout(() => setCopy((value) => (value === variant ? null : value)), 1200)
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
            void theme.setCodeThemeId(evt.target.value)
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
            <span className="label">{item === "surface" ? "Background" : item === "ink" ? "Foreground" : "Accent"}</span>
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
                  if (evt.key !== "Enter") return
                  evt.preventDefault()
                  paint(theme, item, evt.currentTarget.value.trim())
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
            <span className="label">{item === "ui" ? "UI Font" : "Code Font"}</span>
            <input
              className="text"
              disabled={theme.isDisabled}
              key={`${variant}-${item}-${theme.fonts[item] ?? ""}`}
              onBlur={(evt) => font(theme, item, evt.target.value.trim())}
              onKeyDown={(evt) => {
                if (evt.key !== "Enter") return
                evt.preventDefault()
                font(theme, item, evt.currentTarget.value.trim())
              }}
              placeholder={item === "ui" ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace'}
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
            onChange={(evt) => theme.setThemePatch({ contrast: Number(evt.target.value) })}
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
          onChange={(evt) => theme.setThemePatch({ opaqueWindows: !evt.target.checked })}
          type="checkbox"
        />
      </label>

      <label className="field">
        <span className="label">Import Theme</span>
        <div className="import-row">
          <input
            className="text"
            onChange={(evt) => setText((value) => ({ ...value, [variant]: evt.target.value }))}
            placeholder={theme.exportThemeString()}
            spellCheck={false}
            type="text"
            value={text[variant]}
          />
          <button
            className="ghost-btn"
            disabled={theme.isDisabled || !theme.canImportThemeString(text[variant])}
            onClick={() => {
              void theme.importThemeString(text[variant]).then(() => {
                setText((value) => ({ ...value, [variant]: "" }))
              })
            }}
          >
            Import
          </button>
        </div>
      </label>
    </article>
  )

  return (
    <main className="settings-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Codex Appearance</p>
          <h1>Theme Demo</h1>
          <p className="muted">
            This demo now follows Codex’s actual theme model: `appearanceTheme`, split light/dark code theme ids,
            split light/dark chrome themes, and the same share-string format used by the app.
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
          <pre className="term">
            <span className="k">$</span> bun run dev
            {"\n"}
            <span className="f">vite</span> ready in <span className="v">126ms</span>
            {"\n"}
            <span className="t">scheme</span>: <span className="s">{ctx.scheme}</span>
            {"\n"}
            <span className="t">theme</span>: <span className="a">{ctx.active.selectedCodeTheme.id}</span>
            {"\n"}
            <span className="t">surface</span>: <span className="s">{ctx.active.theme.surface}</span>
          </pre>
        </article>
      </section>

      <section className="variant-grid">
        {panel("light", ctx.light)}
        {panel("dark", ctx.dark)}
      </section>
    </main>
  )
}

export default App
