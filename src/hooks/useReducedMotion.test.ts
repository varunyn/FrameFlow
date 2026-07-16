import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from './useReducedMotion'

let changeHandler: ((event: MediaQueryListEvent) => void) | null = null

function mockMediaQueryList(matches: boolean) {
  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') changeHandler = handler
    }),
    removeEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
      if (event === 'change' && changeHandler === handler) changeHandler = null
    }),
    dispatchEvent: vi.fn(),
  }
}

beforeEach(() => {
  changeHandler = null
  window.matchMedia = vi.fn().mockImplementation((query: string) => mockMediaQueryList(false))
})

describe('useReducedMotion', () => {
  it('returns false by default', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when the media query matches', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => mockMediaQueryList(true))
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates when the change event fires', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    act(() => {
      changeHandler?.({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current).toBe(true)

    act(() => {
      changeHandler?.({ matches: false } as MediaQueryListEvent)
    })
    expect(result.current).toBe(false)
  })

  it('shares a single matchMedia subscription across hook instances', () => {
    renderHook(() => useReducedMotion())
    renderHook(() => useReducedMotion())
    expect(window.matchMedia).toHaveBeenCalledTimes(1)
  })
})
