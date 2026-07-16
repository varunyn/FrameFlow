# Privacy Policy Modal Design

## Overview

Add a small privacy-policy link to the directory-upload screen that opens a modal explaining how Frameflow handles user data. The modal is informational and does not require routing.

## Goals

- Reassure users that no photos or data leave their browser.
- Keep the UI unobtrusive and consistent with the existing dark/glass aesthetic.
- Maintain accessibility and reduced-motion support.

## Non-goals

- No separate `/privacy` route.
- No cookie consent or complex legal text.
- No tracking, analytics, or server-side storage to document.

## Design

### User flow

1. User lands on the empty-state upload screen.
2. Below the upload hint text, a subtle "Privacy" link is visible.
3. Clicking the link opens a centered modal overlay with privacy information.
4. The modal closes via the X button, clicking the backdrop, or pressing Escape.

### Components

- `PrivacyModal.tsx` — presentational modal component.
  - Props: `isOpen: boolean`, `onClose: () => void`.
  - Renders a fixed backdrop and a centered panel with heading, bullet list, and close button.
  - Handles Escape key to call `onClose`.
  - Uses `role="dialog"` and `aria-modal="true"`.
- `DirectoryUpload.tsx` — host component.
  - Adds local state `isPrivacyOpen`.
  - Renders the privacy link below the existing hint.
  - Renders `<PrivacyModal isOpen={isPrivacyOpen} onClose={...} />`.

### Content

Heading: **Privacy**

Bullets:

- Your photos are never uploaded to a server.
- Everything is processed and rendered inside your browser.
- Photos and thumbnails are stored locally in your browser's IndexedDB.
- Selecting a new album or clicking "Change album" clears the stored data.

### Styling

- Backdrop: fixed inset, dark translucent background with backdrop blur, matching the lightbox overlay.
- Panel: dark glass panel with rounded corners, a subtle border, and a max-width around `480px`.
- Close button: top-right, circular icon button matching the lightbox close button.
- Privacy link: small, muted inline text below the upload hint; hover brightens.

### Accessibility

- Privacy link button has `aria-label="Read privacy policy"`.
- Close button has `aria-label="Close privacy policy"`.
- Escape key closes the modal.
- Focus is not trapped, consistent with the existing lightbox behavior.

### Reduced motion

- If `prefers-reduced-motion: reduce` is active, the modal appears instantly without fade/scale animation.

## Testing

- `PrivacyModal.test.tsx`
  - Renders content when `isOpen` is true.
  - Does not render when `isOpen` is false.
  - Calls `onClose` when the close button is clicked.
  - Calls `onClose` when the backdrop is clicked.
  - Calls `onClose` when Escape is pressed.
- `DirectoryUpload.test.tsx`
  - Shows the privacy link.
  - Opens the modal when the privacy link is clicked.

## Files changed

- `src/components/PrivacyModal.tsx` (new)
- `src/components/PrivacyModal.test.tsx` (new)
- `src/components/DirectoryUpload.tsx` (modify)
- `src/components/DirectoryUpload.test.tsx` (modify)
- `src/styles/global.css` (modify)
