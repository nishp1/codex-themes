import { useCallback, useEffect, useRef, useState } from "react"

const EVT = "codex-config"

type EventDetail = {
  key: string
  value: string | null
}

function read(key: string) {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(key)
}

function write(key: string, value: string | null) {
  if (typeof window === "undefined") return
  if (value == null) window.localStorage.removeItem(key)
  else window.localStorage.setItem(key, value)
  window.dispatchEvent(new CustomEvent<EventDetail>(EVT, { detail: { key, value } }))
}

export function useConfig<T>(key: string, parse: (value: string | null) => T, format: (value: T) => string | null) {
  const [data, setData] = useState(() => parse(read(key)))
  const ref = useRef(data)

  ref.current = data

  useEffect(() => {
    const storage = (evt: StorageEvent) => {
      if (evt.key !== key) return
      const next = parse(evt.newValue)
      ref.current = next
      setData(next)
    }

    const event = (evt: Event) => {
      const detail = (evt as CustomEvent<EventDetail>).detail
      if (detail.key !== key) return
      const next = parse(detail.value)
      ref.current = next
      setData(next)
    }

    window.addEventListener("storage", storage)
    window.addEventListener(EVT, event as EventListener)
    return () => {
      window.removeEventListener("storage", storage)
      window.removeEventListener(EVT, event as EventListener)
    }
  }, [key, parse])

  const getCachedData = useCallback(() => ({ value: ref.current }), [])

  const setCachedData = useCallback((value: T) => {
    ref.current = value
    setData(value)
  }, [])

  const writeData = useCallback(
    async (value: T) => {
      ref.current = value
      setData(value)
      write(key, format(value))
    },
    [format, key],
  )

  const invalidate = useCallback(async () => {}, [])

  const setValue = useCallback(
    async (value: T) => {
      const prev = getCachedData()
      setCachedData(value)
      try {
        await writeData(value)
      } catch (err) {
        setCachedData(prev.value)
        throw err
      } finally {
        await invalidate()
      }
    },
    [getCachedData, invalidate, setCachedData, writeData],
  )

  return {
    data,
    getCachedData,
    invalidate,
    isLoading: false,
    setCachedData,
    setData: setValue,
    writeData,
  }
}
