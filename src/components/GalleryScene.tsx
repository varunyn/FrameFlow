import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import type { Photo } from '../data/gallery'
import { isCardVisible, splitIntoRows } from '../lib/grid-layout'
import { PhotoCard } from './PhotoCard'

type GallerySceneProps = {
  photos: Photo[]
  rotation: number
  verticalOffset: number
  focusedPhotoId: string | null
  onRotate: (delta: number) => void
  onRelease: (velocity: number) => void
  onVerticalOffset: (delta: number) => void
  onReleaseVertical: (velocity: number) => void
  onDragStart: () => void
  onFocus: (photo: Photo) => void
  onClearFocus: () => void
}

export const COLUMNS = 15

// Keep cards mounted well before they can enter the visible part of the scene.
// A small window makes vertical scrolling look like cards are popping in/out at
// the viewport edge, especially while a spring animation is still moving.
const CARD_OVERSCAN = { rowWindow: 5, columnWindow: 4 }

export function GalleryScene({
  photos,
  rotation,
  verticalOffset,
  focusedPhotoId,
  onRotate,
  onRelease,
  onVerticalOffset,
  onReleaseVertical,
  onDragStart,
  onFocus,
  onClearFocus,
}: GallerySceneProps) {
  const pointerRef = useRef({ active: false, x: 0, y: 0, moved: false, velocityX: 0, velocityY: 0, photo: null as Photo | null })
  const rows = useMemo(() => splitIntoRows(photos, COLUMNS), [photos])
  const totalRows = rows.length
  const totalColumns = COLUMNS

  if (photos.length === 0) {
    return (
      <div className="gallery-scene" role="application" aria-label="Photo gallery" tabIndex={0}>
        <div className="gallery-empty">No photos to display</div>
      </div>
    )
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') onRotate(-0.7)
      if (event.key === 'ArrowRight') onRotate(0.7)
      if (event.key === 'ArrowUp') onVerticalOffset(-0.8)
      if (event.key === 'ArrowDown') onVerticalOffset(0.8)
      if (event.key === 'Escape') onClearFocus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClearFocus, onRotate, onVerticalOffset])

  function photoFromCardElement(el: Element | null): Photo | null {
    const card = el?.closest<HTMLElement>('.photo-card')
    const photoId = card?.dataset.photoId
    return photoId ? photos.find((item) => item.id === photoId) ?? null : null
  }

  function resolvePhotoUnderPointer(event: React.PointerEvent<HTMLDivElement>): Photo | null {
    // The hit target is the topmost element.  If that's a card, the user is
    // pointing at it directly.
    const direct = photoFromCardElement(event.target as Element | null)
    if (direct) return direct

    // Overlapping bounding boxes can put another card on top of the one the
    // user sees.  elementsFromPoint returns front-to-back; the last card is the
    // rearmost visible card under the pointer, which is the one they likely
    // want.
    const elements = document.elementsFromPoint(event.clientX, event.clientY)
    for (let i = elements.length - 1; i >= 0; i--) {
      const photo = photoFromCardElement(elements[i])
      if (photo) return photo
    }

    return null
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const photo = resolvePhotoUnderPointer(event)
    pointerRef.current = { active: true, x: event.clientX, y: event.clientY, moved: false, velocityX: 0, velocityY: 0, photo }
    onDragStart()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (!pointer.active) return
    const dx = event.clientX - pointer.x
    const dy = event.clientY - pointer.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) pointer.moved = true
    pointer.velocityX = -dx * 0.018
    pointer.velocityY = -dy * 0.018
    onRotate(pointer.velocityX)
    onVerticalOffset(pointer.velocityY)
    pointer.x = event.clientX
    pointer.y = event.clientY
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (pointer.moved) {
      onRelease(pointer.velocityX * 12)
      onReleaseVertical(pointer.velocityY * 12)
    } else if (pointer.photo) {
      onFocus(pointer.photo)
    }
    pointer.active = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      onRotate(event.deltaX * 0.011)
    } else {
      onVerticalOffset(event.deltaY * 0.011)
    }
  }

  return (
    <motion.div
      className="gallery-scene"
      style={{ '--elevation': '0deg' } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onClick={(event) => {
        const pointer = pointerRef.current
        if (!pointer.photo && event.target === event.currentTarget && !pointer.moved) {
          onClearFocus()
        }
        pointer.moved = false
        pointer.photo = null
      }}
      role="application"
      aria-label="Interactive photo gallery. Drag or use the arrow keys to rotate and scroll."
      tabIndex={0}
    >
      <div className="gallery-scene__glow" aria-hidden="true" />
      <div className="gallery-scene__wall">
        {rows.map((rowPhotos, rowIndex) =>
          rowPhotos.map((photo, columnIndex) => {
            if (!isCardVisible(
              rowIndex,
              columnIndex,
              verticalOffset,
              rotation,
              totalRows,
              totalColumns,
              CARD_OVERSCAN,
            )) {
              return null
            }
            return (
              <PhotoCard
                key={photo.id}
                photo={photo}
                row={rowIndex}
                column={columnIndex}
                totalColumns={totalColumns}
                rotation={rotation}
                verticalOffset={verticalOffset}
                isFocused={photo.id === focusedPhotoId}
                onFocus={onFocus}
              />
            )
          }),
        )}
      </div>
    </motion.div>
  )
}
