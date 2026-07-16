import { describe, expect, it, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { getPhotos, savePhotos, clearPhotos } from './storage'

describe('storage', () => {
  beforeEach(async () => {
    await clearPhotos()
  })

  it('returns an empty array when no photos are stored', async () => {
    const photos = await getPhotos()
    expect(photos).toEqual([])
  })

  it('saves and retrieves photos', async () => {
    const photos = [{ id: 'a', name: 'a.jpg', src: 'data:image/jpeg;base64,AAA', thumbSrc: 'data:image/jpeg;base64,BBB', fullSrc: 'data:image/jpeg;base64,CCC', index: 0 }]
    await savePhotos(photos)
    const result = await getPhotos()
    expect(result).toEqual(photos)
  })
})
