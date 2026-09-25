import { HEX_DIRECTIONS, HexCell } from './hex'
import { hexCellCenter, HexGridBounds, PixelPoint } from './hex-layout'

/** セル中心からこの距離(`hexSize` 比)以内に入ったら中心に到達したとみなす */
export const CELL_REACH_THRESHOLD_RATIO = 0.3

const isSameCell = (a: HexCell, b: HexCell) => a.q === b.q && a.r === b.r

/**
 * actor の描画位置から、セル中心への到達を判定する
 *
 * - 描画位置に最も近いセルを到達判定の対象にする。描画位置は移動元〜移動先の間に
 *   あるため、候補は移動先セルとその隣接のみで足りる
 * - 次のどちらかを満たせば到達とする
 *   - 中心から `CELL_REACH_THRESHOLD_RATIO` の範囲内
 *   - 中心を過ぎている(移動先が既に次のセルへ切り替わっているのに、描画位置が\
 *     まだそのセルにある)。判定の間隔が粗く範囲内を見逃した場合の即時扱い
 * - 通知済みのセル(`lastReachedCell`)は対象外
 *
 * @param position actor の現在の描画位置
 * @param targetCell actor の移動先セル(移動中でなければ現在セル)
 * @param lastReachedCell 最後に到達と判定したセル
 * @param hexSize 六角形の外接円半径 (px)
 * @param bounds `computeHexGridBounds` の結果
 * @returns 到達したセル。未到達・通知済みなら `undefined`
 */
export const judgeCellReach = (
  position: PixelPoint,
  targetCell: HexCell,
  lastReachedCell: HexCell | undefined,
  hexSize: number,
  bounds: Pick<HexGridBounds, 'cellHeight' | 'cellWidth' | 'minX' | 'minY'>,
): HexCell | undefined => {
  const distanceTo = (cell: HexCell) => {
    const center = hexCellCenter(cell, hexSize, bounds)

    return Math.hypot(center.x - position.x, center.y - position.y)
  }
  const candidates = [
    targetCell,
    ...HEX_DIRECTIONS.map((d) => ({
      q: targetCell.q + d.q,
      r: targetCell.r + d.r,
    })),
  ]
  const nearestCell = candidates.reduce((best, cell) =>
    distanceTo(cell) < distanceTo(best) ? cell : best,
  )

  if (lastReachedCell && isSameCell(nearestCell, lastReachedCell)) return

  const isNearCenter =
    distanceTo(nearestCell) <= hexSize * CELL_REACH_THRESHOLD_RATIO
  const hasPassedCenter = !isSameCell(nearestCell, targetCell)

  return isNearCenter || hasPassedCenter ? nearestCell : undefined
}
