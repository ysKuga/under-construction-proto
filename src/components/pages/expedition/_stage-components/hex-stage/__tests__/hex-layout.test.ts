import { describe, expect, it } from 'vitest'

import { colRowToAxial } from '../_lib/hex'
import { axialToPixel } from '../_lib/hex-layout'

describe('axialToPixel', () => {
  it('原点は (0, 0)', () => {
    expect(axialToPixel(colRowToAxial(0, 0), 10)).toEqual({ x: 0, y: 0 })
  })

  it('奇数列は偶数列より半セル分下にずれる(flat-top ジグザグ)', () => {
    const evenCol = axialToPixel(colRowToAxial(2, 0), 10)
    const oddCol = axialToPixel(colRowToAxial(1, 0), 10)

    expect(oddCol.y).toBeGreaterThan(evenCol.y)
  })

  it('同一列内の行差は縦方向の等間隔移動になる', () => {
    const row0 = axialToPixel(colRowToAxial(0, 0), 10)
    const row1 = axialToPixel(colRowToAxial(0, 1), 10)

    expect(row0.x).toBe(row1.x)
    expect(row1.y - row0.y).toBeCloseTo(10 * Math.sqrt(3))
  })
})
