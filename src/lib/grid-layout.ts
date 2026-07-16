export type Transform = {
  x: number // vw
  y: number // vh
  z: number // px
  rotateY: number // deg
  rotateX: number // deg
  scale: number
  opacity: number
  blur: number // px
}

export function splitIntoRows<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns))
  }
  return rows
}

export function wrappedColumnDistance(column: number, rotation: number, totalColumns: number): number {
  const raw = column - rotation
  return ((raw + totalColumns / 2) % totalColumns + totalColumns) % totalColumns - totalColumns / 2
}

export function isCardVisible(
  row: number,
  column: number,
  verticalOffset: number,
  rotation: number,
  totalRows: number,
  totalColumns: number,
  options: { rowWindow?: number; columnWindow?: number } = {},
): boolean {
  const { rowWindow = 2, columnWindow = 3 } = options
  const rowDist = Math.abs(row - verticalOffset)
  const colDist = Math.abs(wrappedColumnDistance(column, rotation, totalColumns))
  return rowDist <= rowWindow && colDist <= columnWindow
}

export function computeCardTransform(
  row: number,
  column: number,
  rotation: number,
  verticalOffset: number,
  totalColumns: number,
): Transform {
  const anglePerColumn = (2 * Math.PI) / totalColumns
  const anglePerRow = 0.1 // ~6° per row

  const colDist = wrappedColumnDistance(column, rotation, totalColumns)
  const rowDist = row - verticalOffset

  const horizAngle = colDist * anglePerColumn
  const vertAngle = rowDist * anglePerRow

  const radius = 40 // used for both vw-based x and px-based z
  const rowHeight = 14 // vh per row

  // Cylinder-like x, linear vertical y, spherical z recession
  const x = Math.sin(horizAngle) * radius
  const y = rowDist * rowHeight
  const z = (Math.cos(horizAngle) * Math.cos(vertAngle) - 1) * radius

  const rotateY = (-horizAngle * 180) / Math.PI
  const rotateX = (-vertAngle * 180) / Math.PI

  const normalized = Math.min(Math.abs(colDist) / 4, 1)
  const scale = 1 - normalized * 0.3
  const opacity = Math.max(0.25, 1 - normalized * 0.7)
  const blur = normalized * 3

  return { x, y, z, rotateY, rotateX, scale, opacity, blur }
}
