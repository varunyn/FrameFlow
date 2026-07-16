import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react'
import type { Photo } from './data/gallery'
import { galleryMeta, loadAlbumMeta, loadPhotos } from './data/gallery'
import { GalleryScene, COLUMNS } from './components/GalleryScene'
import { Controls } from './components/Controls'
import { PhotoLightbox } from './components/PhotoLightbox'
import { DirectoryUpload } from './components/DirectoryUpload'
import { wrappedColumnDistance } from './lib/grid-layout'
import { clearPhotos, type AlbumMeta } from './lib/storage'

function duplicatePhotos(base: Photo[]): Photo[] {
  const secondSet = base.map((photo, index) => ({
    ...photo,
    id: `${photo.id}--dup-${index}`,
    index: base.length + index,
  }))
  return [...base, ...secondSet]
}

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [albumMeta, setAlbumMeta] = useState<AlbumMeta>(galleryMeta)
  const [isLoading, setIsLoading] = useState(true)
  const displayPhotos = useMemo(() => duplicatePhotos(photos), [photos])
  const totalRows = Math.ceil(displayPhotos.length / COLUMNS)

  const clampVerticalOffset = useCallback((value: number) => {
    const min = Math.min(2, (totalRows - 1) / 2)
    const max = Math.max(totalRows - 3, (totalRows - 1) / 2)
    return Math.max(min, Math.min(max, value))
  }, [totalRows])

  const rotation = useMotionValue(0)
  const verticalOffset = useMotionValue(0)
  const [rotationState, setRotationState] = useState(0)
  const [verticalOffsetState, setVerticalOffsetState] = useState(0)
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const rotationAnimation = useRef<{ stop: () => void } | null>(null)
  const verticalOffsetAnimation = useRef<{ stop: () => void } | null>(null)
  const lightboxTarget = useRef<Photo | null>(null)
  const reducedMotion = useRef(false)

  useEffect(() => {
    Promise.all([loadPhotos(), loadAlbumMeta()]).then(([loaded, meta]) => {
      setPhotos(loaded)
      if (meta) setAlbumMeta(meta)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    verticalOffset.set(clampVerticalOffset((totalRows - 1) / 2))
  }, [totalRows, clampVerticalOffset, verticalOffset])

  useMotionValueEvent(rotation, 'change', (latest) => setRotationState(latest))
  useMotionValueEvent(verticalOffset, 'change', (latest) => setVerticalOffsetState(latest))

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function syncFullscreen() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const handlePhotosUploaded = useCallback(() => {
    Promise.all([loadPhotos(), loadAlbumMeta()]).then(([loaded, meta]) => {
      setPhotos(loaded)
      if (meta) setAlbumMeta(meta)
    })
  }, [])

  const handleClearAlbum = useCallback(() => {
    clearPhotos().then(() => {
      setPhotos([])
      setAlbumMeta(galleryMeta)
      setFocusedPhotoId(null)
      setLightboxPhoto(null)
    })
  }, [])

  const startDrag = useCallback(() => {
    rotationAnimation.current?.stop()
    verticalOffsetAnimation.current?.stop()
  }, [])

  const rotate = useCallback((delta: number) => {
    rotation.set(rotation.get() + delta)
  }, [rotation])

  const springRotate = useCallback((delta: number) => {
    rotationAnimation.current?.stop()
    if (reducedMotion.current) {
      rotation.set(rotation.get() + delta)
      return
    }
    rotationAnimation.current = animate(rotation, rotation.get() + delta, {
      type: 'spring',
      stiffness: 400,
      damping: 35,
      mass: 0.4,
    })
  }, [rotation])

  const releaseRotate = useCallback((velocity: number) => {
    springRotate(velocity)
  }, [springRotate])

  const adjustVerticalOffset = useCallback((delta: number) => {
    verticalOffset.set(clampVerticalOffset(verticalOffset.get() + delta))
  }, [verticalOffset, clampVerticalOffset])

  const springVerticalOffset = useCallback((delta: number) => {
    verticalOffsetAnimation.current?.stop()
    const target = clampVerticalOffset(verticalOffset.get() + delta)
    if (reducedMotion.current) {
      verticalOffset.set(target)
      return
    }
    verticalOffsetAnimation.current = animate(verticalOffset, target, {
      type: 'spring',
      stiffness: 400,
      damping: 35,
      mass: 0.4,
    })
  }, [verticalOffset, clampVerticalOffset])

  const releaseVerticalOffset = useCallback((velocity: number) => {
    springVerticalOffset(velocity)
  }, [springVerticalOffset])

  const focusPhoto = useCallback((photo: Photo) => {
    const row = Math.floor(photo.index / COLUMNS)
    const column = photo.index % COLUMNS
    const targetRotationDelta = wrappedColumnDistance(column, rotation.get(), COLUMNS)
    const targetVerticalDelta = row - verticalOffset.get()

    rotationAnimation.current?.stop()
    verticalOffsetAnimation.current?.stop()
    setFocusedPhotoId(photo.id)
    lightboxTarget.current = photo

    const targetVerticalOffset = clampVerticalOffset(verticalOffset.get() + targetVerticalDelta)

    if (reducedMotion.current) {
      rotation.set(rotation.get() + targetRotationDelta)
      verticalOffset.set(targetVerticalOffset)
      setLightboxPhoto(photo)
      return
    }

    let completedAnimations = 0
    function onAnimationComplete() {
      completedAnimations += 1
      if (completedAnimations === 2 && lightboxTarget.current?.id === photo.id) {
        setLightboxPhoto(photo)
      }
    }

    rotationAnimation.current = animate(rotation, rotation.get() + targetRotationDelta, {
      type: 'spring',
      stiffness: 160,
      damping: 25,
      mass: 0.8,
      onComplete: onAnimationComplete,
    })

    verticalOffsetAnimation.current = animate(verticalOffset, targetVerticalOffset, {
      type: 'spring',
      stiffness: 160,
      damping: 25,
      mass: 0.8,
      onComplete: onAnimationComplete,
    })
  }, [rotation, verticalOffset, clampVerticalOffset])

  const clearFocus = useCallback(() => {
    lightboxTarget.current = null
    setFocusedPhotoId(null)
    setLightboxPhoto(null)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.()
    } else {
      await document.exitFullscreen?.()
    }
  }, [])

  return (
    <main className="app-shell">
      <div className="ambient-noise" aria-hidden="true" />
      <header className="gallery-header">
        <div className="gallery-header__title-block">
          <h1>{albumMeta.title}</h1>
        </div>
      </header>

      <Controls isFullscreen={isFullscreen} onFullscreen={toggleFullscreen} onBack={handleClearAlbum} />

      {photos.length > 0 && (
        <button
          className="change-album-button glass-button"
          type="button"
          onClick={handleClearAlbum}
          aria-label="Change album"
        >
          Change album
        </button>
      )}

      {isLoading ? (
        <div className="gallery-scene" role="status" aria-live="polite">
          <div className="gallery-empty">Loading…</div>
        </div>
      ) : photos.length === 0 ? (
        <div className="gallery-scene">
          <DirectoryUpload onPhotosUploaded={handlePhotosUploaded} />
        </div>
      ) : (
        <GalleryScene
          photos={displayPhotos}
          rotation={rotationState}
          verticalOffset={verticalOffsetState}
          focusedPhotoId={focusedPhotoId}
          onRotate={rotate}
          onRelease={releaseRotate}
          onVerticalOffset={adjustVerticalOffset}
          onReleaseVertical={releaseVerticalOffset}
          onDragStart={startDrag}
          onFocus={focusPhoto}
          onClearFocus={clearFocus}
        />
      )}

      {focusedPhotoId && (
        <div className="focus-label" role="status">
          <span className="focus-label__dot" />
          <span>{albumMeta.title}</span>
          <span className="focus-label__divider">·</span>
          <span>Photo {(displayPhotos.findIndex((photo) => photo.id === focusedPhotoId) % photos.length) + 1}</span>
        </div>
      )}

      <PhotoLightbox photo={lightboxPhoto} albumMeta={albumMeta} onClose={clearFocus} />
    </main>
  )
}
