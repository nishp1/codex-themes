import { useSyncExternalStore } from "react"
import type { Scheme } from "./service"
import type { Mode } from "./theme"

type Bridge = {
  getSystemThemeVariant?: () => Mode
  subscribeToSystemThemeVariant?: (notify: () => void) => (() => void) | void
}

function bridge() {
  if (typeof window === "undefined") return
  return (window as Window & { electronBridge?: Bridge }).electronBridge
}

function empty() {
  return () => {}
}

function subscribe(notify: () => void) {
  const item = bridge()?.subscribeToSystemThemeVariant
  if (item != null) return item(notify) ?? empty()
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return empty()
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const fn = () => notify()
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", fn)
    return () => media.removeEventListener("change", fn)
  }
  if (typeof media.addListener === "function" && typeof media.removeListener === "function") {
    media.addListener(fn)
    return () => media.removeListener(fn)
  }
  return empty()
}

export function getSystemThemeVariant(): Mode {
  const item = bridge()?.getSystemThemeVariant?.()
  if (item != null) return item
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function themeVariants(scheme: Scheme): Mode[] {
  return scheme === "system" ? ["light", "dark"] : [scheme]
}

export function useResolvedThemeVariant(scheme: Scheme): Mode {
  const get = scheme === "system" ? getSystemThemeVariant : () => scheme
  return useSyncExternalStore(scheme === "system" ? subscribe : empty, get, get)
}
