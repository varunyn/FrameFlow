import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrivacyModal } from './PrivacyModal'

describe('PrivacyModal', () => {
  it('renders content when open', () => {
    render(<PrivacyModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(screen.getByText(/never uploaded to a server/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<PrivacyModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<PrivacyModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close privacy policy/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<PrivacyModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<PrivacyModal isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
