import { describe, expect, it } from 'vitest'
import { splitIntoRows, wrappedColumnDistance, isCardVisible, computeCardTransform } from './grid-layout'

describe('splitIntoRows', () => {
  it('splits items into rows of N columns', () => {
    expect(splitIntoRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })
})

describe('wrappedColumnDistance', () => {
  it('returns shortest signed distance on a cylinder', () => {
    expect(wrappedColumnDistance(0, 0, 8)).toBe(0)
    expect(wrappedColumnDistance(1, 0, 8)).toBe(1)
    expect(wrappedColumnDistance(7, 0, 8)).toBe(-1)
    expect(wrappedColumnDistance(0, 7, 8)).toBe(1)
  })
})

describe('isCardVisible', () => {
  it('shows cards near the current viewport', () => {
    expect(isCardVisible(2, 5, 2, 5, 10, 12)).toBe(true)
    expect(isCardVisible(8, 5, 2, 5, 10, 12)).toBe(false)
  })
})

describe('computeCardTransform', () => {
  it('centers the card when row/column match offsets', () => {
    const t = computeCardTransform(3, 5, 5, 3, 10)
    expect(t.x).toBeCloseTo(0)
    expect(t.y).toBeCloseTo(0)
    expect(t.rotateY).toBeCloseTo(0)
  })

  it('moves edge cards back in z and rotates them', () => {
    const t = computeCardTransform(0, 2, 0, 0, 8)
    expect(t.z).toBeLessThan(0)
    expect(t.rotateY).not.toBe(0)
  })
})
