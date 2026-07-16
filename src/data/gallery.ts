import { getAlbumMeta, getPhotos, type AlbumMeta } from '../lib/storage'

export type Photo = {
  id: string
  src: string
  alt: string
  title?: string
  fullSrc?: string
  index: number
}

export async function loadPhotos(): Promise<Photo[]> {
  const stored = await getPhotos()
  return stored.map((photo) => ({
    id: photo.id,
    src: photo.src,
    alt: photo.name,
    title: photo.name,
    fullSrc: photo.fullSrc,
    index: photo.index,
  }))
}

export async function loadAlbumMeta(): Promise<AlbumMeta | null> {
  return getAlbumMeta()
}

export const galleryMeta = {
  eyebrow: '',
  title: 'My Gallery',
  count: 0,
}
