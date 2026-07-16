import { useSyncExternalStore } from 'react'

let media: MediaQueryList | null = null
let reduced = false
const listeners = new Set<() => void>()

function handleChange(event: MediaQueryListEvent) {
  if (reduced !== event.matches) {
    reduced = event.matches
    listeners.forEach((callback) => callback())
  }
}

function subscribe(callback: () => void) {
  if (!media) {
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced = media.matches
    media.addEventListener('change', handleChange)
  }

  listeners.add(callback)

  return () => {
    listeners.delete(callback)
    if (listeners.size === 0 && media) {
      media.removeEventListener('change', handleChange)
      media = null
    }
  }
}

function getSnapshot() {
  return reduced
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
