import { Maximize2, Minimize2, ArrowLeft } from 'lucide-react'

type ControlsProps = {
  isFullscreen: boolean
  onFullscreen: () => void
  onBack: () => void
}

export function Controls({ isFullscreen, onFullscreen, onBack }: ControlsProps) {
  return (
    <>
      <button className="back-button glass-button" type="button" onClick={onBack} aria-label="Go back">
        <ArrowLeft size={13} strokeWidth={1.8} />
        <span>Back</span>
      </button>

      <button className="fullscreen-button glass-button" type="button" onClick={onFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        <span>{isFullscreen ? 'Exit' : 'Full screen'}</span>
      </button>
    </>
  )
}
