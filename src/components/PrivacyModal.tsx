import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'

type PrivacyModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="privacy-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Privacy policy"
        >
          <motion.div
            className="privacy-modal__panel"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 24 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.7 }}
          >
            <button
              className="privacy-modal__close"
              type="button"
              onClick={onClose}
              aria-label="Close privacy policy"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
            <h2 className="privacy-modal__heading">Privacy</h2>
            <ul className="privacy-modal__list">
              <li>Your photos are never uploaded to a server.</li>
              <li>Everything is processed and rendered inside your browser.</li>
              <li>Photos and thumbnails are stored locally in your browser's IndexedDB.</li>
              <li>Selecting a new album or clicking "Change album" clears the stored data.</li>
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
