import { memo, useState } from 'react'
import { motion } from 'motion/react'
import type { Photo } from '../data/gallery'
import { computeCardTransform } from '../lib/grid-layout'
import { useReducedMotion } from '../hooks/useReducedMotion'

type PhotoCardProps = {
  photo: Photo
  row: number
  column: number
  totalColumns: number
  rotation: number
  verticalOffset: number
  isFocused: boolean
  onFocus: (photo: Photo) => void
}

function PhotoCardComponent({
  photo,
  row,
  column,
  totalColumns,
  rotation,
  verticalOffset,
  isFocused,
  onFocus,
}: PhotoCardProps) {
  const [hasError, setHasError] = useState(false)
  const reducedMotion = useReducedMotion()
  const layoutId = isFocused && !reducedMotion ? `photo-${photo.id}` : undefined
  const { x, y, z, rotateY, rotateX, scale, opacity, blur } = computeCardTransform(
    row,
    column,
    rotation,
    verticalOffset,
    totalColumns,
  )

  return (
    <button
      type="button"
      className={`photo-card${isFocused ? ' photo-card--focused' : ''}`}
      data-photo-id={photo.id}
      style={{
        left: '50%',
        top: '50%',
        // Cards closer to the viewer should receive pointer events first.
        // Using opacity here put dim edge cards above centered cards.
        zIndex: isFocused ? 50 : Math.max(1, Math.round(40 + z)),
        transform: `translate3d(calc(-50% + ${x}vw), calc(-50% + ${y}vh), ${z}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onFocus(photo)
        }
      }}
      aria-label={`Focus ${photo.alt}`}
      aria-pressed={isFocused}
    >
      <span className={`photo-card__frame${hasError ? ' photo-card__frame--error' : ''}`}>
        {!hasError && (
          <motion.div
            className="photo-card__image-layout"
            layoutId={layoutId}
            data-layout-id={layoutId}
            style={{ borderRadius: 'inherit', overflow: 'hidden', width: '100%', height: '100%' }}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading={photo.index < 18 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              onError={() => setHasError(true)}
            />
          </motion.div>
        )}
        <span className="photo-card__sheen" />
      </span>
    </button>
  )
}

export const PhotoCard = memo(PhotoCardComponent)
