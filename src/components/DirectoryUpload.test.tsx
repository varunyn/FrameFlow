import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { DirectoryUpload } from './DirectoryUpload'
import * as storage from '../lib/storage'
import * as thumbnails from '../lib/thumbnails'

describe('DirectoryUpload', () => {
  beforeEach(() => {
    vi.spyOn(storage, 'savePhotos').mockResolvedValue(undefined)
    vi.spyOn(storage, 'saveAlbumMeta').mockResolvedValue(undefined)
    vi.spyOn(thumbnails, 'generateThumbnail').mockResolvedValue('data:image/jpeg;base64,thumb')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls onPhotosUploaded after processing image files', async () => {
    const onPhotosUploaded = vi.fn()
    render(<DirectoryUpload onPhotosUploaded={onPhotosUploaded} />)

    const input = screen.getByLabelText(/choose folder/i)
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'webkitRelativePath', { value: 'album/photo.jpg' })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(onPhotosUploaded).toHaveBeenCalled())
  })
})
