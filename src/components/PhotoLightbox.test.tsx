import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PhotoLightbox } from './PhotoLightbox'

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

describe('PhotoLightbox', () => {
  it('renders the image with the correct layoutId', () => {
    render(
      <PhotoLightbox
        photo={{ id: 'p1', src: '/thumb.jpg', alt: 'Test', index: 0, fullSrc: '/full.jpg' }}
        albumMeta={{ title: 'Test Album' }}
        onClose={vi.fn()}
      />,
    )
    expect(document.querySelector('[data-layout-id="photo-p1"]')).toBeInTheDocument()
    expect(screen.getByAltText('Test')).toBeInTheDocument()
  })

  it('does not set layoutId and disables flip animation when reduced motion is enabled', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => mockMediaQueryList(true))
    render(
      <PhotoLightbox
        photo={{ id: 'p1', src: '/thumb.jpg', alt: 'Test', index: 0, fullSrc: '/full.jpg' }}
        albumMeta={{ title: 'Test Album' }}
        onClose={vi.fn()}
      />,
    )
    expect(document.querySelector('[data-layout-id]')).not.toBeInTheDocument()
    expect(document.querySelector('.photo-lightbox__shimmer')).not.toBeInTheDocument()
    expect(screen.getByAltText('Test')).toBeInTheDocument()
  })
})
