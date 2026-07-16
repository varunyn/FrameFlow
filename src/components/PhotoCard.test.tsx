import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PhotoCard } from './PhotoCard'

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

describe('PhotoCard', () => {
  const photo = {
    id: 'p1',
    src: '/test.jpg',
    alt: 'Test',
    title: 'Test',
    index: 0,
  }

  it('renders with accessible label', () => {
    render(
      <PhotoCard
        photo={photo}
        row={0}
        column={0}
        totalColumns={8}
        rotation={0}
        verticalOffset={0}
        isFocused={false}
        onFocus={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /Focus Test/i })).toBeInTheDocument()
  })

  it('opens the selected photo when activated with keyboard', () => {
    const onFocus = vi.fn()
    render(
      <PhotoCard
        photo={photo}
        row={0}
        column={0}
        totalColumns={8}
        rotation={0}
        verticalOffset={0}
        isFocused={false}
        onFocus={onFocus}
      />,
    )

    fireEvent.keyDown(screen.getByRole('button', { name: /Focus Test/i }), { key: 'Enter' })
    expect(onFocus).toHaveBeenCalledWith(photo)
  })

  it('sets layoutId on the image wrapper when focused', () => {
    render(
      <PhotoCard
        photo={{ id: 'p1', src: '/thumb.jpg', alt: 'Test', index: 0 }}
        row={0}
        column={0}
        totalColumns={15}
        rotation={0}
        verticalOffset={0}
        isFocused={true}
        onFocus={vi.fn()}
      />,
    )
    const wrapper = document.querySelector('[data-layout-id="photo-p1"]')
    expect(wrapper).toBeInTheDocument()
  })

  it('does not set layoutId when reduced motion is enabled', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => mockMediaQueryList(true))
    render(
      <PhotoCard
        photo={{ id: 'p1', src: '/thumb.jpg', alt: 'Test', index: 0 }}
        row={0}
        column={0}
        totalColumns={15}
        rotation={0}
        verticalOffset={0}
        isFocused={true}
        onFocus={vi.fn()}
      />,
    )
    expect(document.querySelector('[data-layout-id]')).not.toBeInTheDocument()
  })
})
