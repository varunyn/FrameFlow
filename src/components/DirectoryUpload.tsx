import { useRef, useState } from 'react'
import { FolderUp } from 'lucide-react'
import { saveAlbumMeta, savePhotos, type StoredPhoto } from '../lib/storage'
import { generateThumbnail } from '../lib/thumbnails'

type DirectoryUploadProps = {
  onPhotosUploaded: () => void
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'])

function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  const name = file.name.toLowerCase()
  return Array.from(IMAGE_EXTENSIONS).some((ext) => name.endsWith(ext))
}

export function DirectoryUpload({ onPhotosUploaded }: DirectoryUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
      .filter(isImageFile)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    if (files.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const albumName = (files[0] as File & { webkitRelativePath?: string }).webkitRelativePath?.split('/')[0] || 'My Gallery'
      const photos: StoredPhoto[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const [fullSrc, thumbSrc] = await Promise.all([
          readFileAsDataURL(file),
          generateThumbnail(file),
        ])
        photos.push({
          id: file.name,
          name: file.name,
          src: thumbSrc,
          thumbSrc,
          fullSrc,
          index: i,
        })
        setProgress(i + 1)
      }
      await savePhotos(photos)
      await saveAlbumMeta({ title: albumName })
      onPhotosUploaded()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to process directory', error)
      alert('Failed to process the selected folder.')
    } finally {
      setIsProcessing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="directory-upload">
      <input
        ref={inputRef}
        id="directory-input"
        type="file"
        // @ts-expect-error webkitdirectory is non-standard
        webkitdirectory=""
        directory=""
        multiple
        accept="image/*"
        onChange={handleChange}
        disabled={isProcessing}
        aria-label="Choose folder"
      />
      <label htmlFor="directory-input" className="directory-upload__button glass-button">
        <FolderUp size={18} />
        <span>{isProcessing ? `Processing ${progress}…` : 'Choose folder'}</span>
      </label>
      <p className="directory-upload__hint">Select a folder of images to build your gallery.</p>
    </div>
  )
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
