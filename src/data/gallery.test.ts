import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { loadPhotos, galleryMeta } from './gallery'
import * as storage from '../lib/storage'

describe('loadPhotos', () => {
  beforeEach(() => {
    vi.spyOn(storage, 'getPhotos').mockResolvedValue([
      { id: 'a.jpg', name: 'a.jpg', src: 'thumb', thumbSrc: 'thumb', fullSrc: 'full', index: 0 },
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps stored photos to public Photo shape', async () => {
    const photos = await loadPhotos()
    expect(photos).toHaveLength(1)
    expect(photos[0]).toMatchObject({
      id: 'a.jpg',
      src: 'thumb',
      fullSrc: 'full',
      alt: 'a.jpg',
      title: 'a.jpg',
      index: 0,
    })
  })

  it('provides a generic galleryMeta', () => {
    expect(galleryMeta.title).toBe('My Gallery')
    expect(galleryMeta.eyebrow).toBe('')
  })
})
