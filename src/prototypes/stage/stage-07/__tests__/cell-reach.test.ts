import { describe, expect, it } from 'vitest'

import { CELL_REACH_THRESHOLD_RATIO, judgeCellReach } from '../_lib/cell-reach'
import { HexCell } from '../_lib/hex'
import { computeHexGridBounds, hexCellCenter } from '../_lib/hex-layout'

const HEX_SIZE = 20
const BOUNDS = computeHexGridBounds(5, 5, HEX_SIZE)
const FROM: HexCell = { q: 1, r: 1 }
const TO: HexCell = { q: 2, r: 1 }

/** `from` の中心から `to` の中心へ `ratio` 進んだ描画位置 */
const between = (from: HexCell, to: HexCell, ratio: number) => {
  const a = hexCellCenter(from, HEX_SIZE, BOUNDS)
  const b = hexCellCenter(to, HEX_SIZE, BOUNDS)

  return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio }
}

describe('judgeCellReach', () => {
  it('中心の範囲内に入ったら、そのセルに到達したと判定する', () => {
    expect(
      judgeCellReach(between(FROM, TO, 0.95), TO, FROM, HEX_SIZE, BOUNDS),
    ).toEqual(TO)
  })

  it('中心の範囲外なら到達と判定しない', () => {
    expect(
      judgeCellReach(between(FROM, TO, 0.6), TO, FROM, HEX_SIZE, BOUNDS),
    ).toBeUndefined()
  })

  it('移動先が次のセルへ切り替わった後にまだ前のセルにいれば、中心を過ぎたとみなし即時に到達と判定する', () => {
    const next: HexCell = { q: 3, r: 0 }
    const position = between(TO, next, 0.4)
    const center = hexCellCenter(TO, HEX_SIZE, BOUNDS)

    // 範囲外であることを前提として確認する
    expect(
      Math.hypot(center.x - position.x, center.y - position.y),
    ).toBeGreaterThan(HEX_SIZE * CELL_REACH_THRESHOLD_RATIO)
    expect(judgeCellReach(position, next, FROM, HEX_SIZE, BOUNDS)).toEqual(TO)
  })

  it('到達済みのセルは再度判定しない', () => {
    expect(
      judgeCellReach(between(FROM, TO, 1), TO, TO, HEX_SIZE, BOUNDS),
    ).toBeUndefined()
  })

  it('停止中は現在セルに到達したと判定する', () => {
    expect(
      judgeCellReach(between(FROM, TO, 0), FROM, undefined, HEX_SIZE, BOUNDS),
    ).toEqual(FROM)
  })
})
