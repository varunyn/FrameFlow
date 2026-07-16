const DEFAULT_MAX_SIZE = 320

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

export async function generateThumbnail(file: File, maxSize = DEFAULT_MAX_SIZE): Promise<string> {
  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImage(dataUrl)

  if (img.width <= maxSize && img.height <= maxSize) {
    return dataUrl
  }

  const ratio = Math.min(maxSize / img.width, maxSize / img.height)
  const width = Math.round(img.width * ratio)
  const height = Math.round(img.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.85)
}
