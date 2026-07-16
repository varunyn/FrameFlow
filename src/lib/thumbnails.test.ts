import { describe, expect, it, vi } from 'vitest'
import { generateThumbnail } from './thumbnails'

describe('generateThumbnail', () => {
  it('returns the original data URL for small images', async () => {
    const dataUrl = 'data:image/png;base64,AAA'
    const file = new File(['ignored'], 'tiny.png', { type: 'image/png' })

    vi.stubGlobal(
      'FileReader',
      class {
        readAsDataURL() {
          setTimeout(() => (this as unknown as { onload: () => void }).onload(), 0)
        }
        get result() {
          return dataUrl
        }
      },
    )

    vi.stubGlobal(
      'Image',
      class {
        width = 8
        height = 8
        set src(value: string) {
          setTimeout(() => (this as unknown as { onload: () => void }).onload(), 0)
        }
      },
    )

    const result = await generateThumbnail(file, 10)
    expect(result).toBe(dataUrl)

    vi.unstubAllGlobals()
  })
})
