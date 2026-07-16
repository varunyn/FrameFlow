import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { Photo } from '../data/gallery'
import type { AlbumMeta } from '../lib/storage'
import { useReducedMotion } from '../hooks/useReducedMotion'

type PhotoLightboxProps = {
  photo: Photo | null
  albumMeta: AlbumMeta
  onClose: () => void
}

export function PhotoLightbox({ photo, albumMeta, onClose }: PhotoLightboxProps) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="photo-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing ${photo.alt}`}
        >
          <motion.div
            className="photo-lightbox__panel"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.82, y: 28, rotateX: 5 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 18 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.75 }}
          >
            <button className="photo-lightbox__close" type="button" onClick={onClose} aria-label="Close image">
              <X size={18} strokeWidth={1.5} />
            </button>
            <div className="photo-lightbox__image-wrap">
              <motion.div
                className="photo-lightbox__flipper"
                layoutId={!reducedMotion ? `photo-${photo.id}` : undefined}
                data-layout-id={!reducedMotion ? `photo-${photo.id}` : undefined}
                initial={reducedMotion ? false : { rotateY: 0 }}
                animate={reducedMotion ? false : { rotateY: 180 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{ transformStyle: 'preserve-3d', borderRadius: 8, overflow: 'hidden' }}
              >
                <img src={photo.fullSrc ?? photo.src} alt={photo.alt} />
                {!reducedMotion && <span className="photo-lightbox__shimmer" aria-hidden="true" />}
              </motion.div>
            </div>
            <div className="photo-lightbox__caption">
              <span>{photo.title ?? 'Photograph'}</span>
              <span className="photo-lightbox__caption-count">{albumMeta.title}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
