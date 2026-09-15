/** ヘクスセルの axial 座標 */
export type HexCell = {
  /** 列方向の軸座標 */
  q: number
  /** 行方向の軸座標 */
  r: number
}

/**
 * axial 座標における隣接6方向のオフセット
 *
 * - flat-top / pointed-top どちらでも同一（画面投影の向きが変わるのみ）
 */
export const HEX_DIRECTIONS: readonly HexCell[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
]

/**
 * 2セルが隣接するか判定する
 *
 * @param a 判定対象セル1
 * @param b 判定対象セル2
 */
export const isHexAdjacent = (a: HexCell, b: HexCell): boolean => {
  const dq = b.q - a.q
  const dr = b.r - a.r

  return HEX_DIRECTIONS.some(
    (direction) => direction.q === dq && direction.r === dr,
  )
}

/**
 * axial 方向オフセットの画面上の角度(rad、atan2(dy, dx))を返す
 *
 * - `hex-layout.ts` の `axialToPixel` と同じ投影式(hexSize=1)。角度のみ求めるため\
 *   hexSize に依存しない。`hex-layout.ts` への import は循環になるため式を複製する
 */
const hexDirectionScreenAngle = (direction: HexCell): number => {
  const dx = 1.5 * direction.q
  const dy = Math.sqrt(3) * (direction.r + direction.q / 2)

  return Math.atan2(dy, dx)
}

/**
 * 移動元→移動先セルの方向を、画面上の角度(rad、atan2 基準: 0 = 右、π/2 = 下)へ変換する
 *
 * - 隣接セル前提(`HEX_DIRECTIONS` のいずれとも一致しない場合は `undefined`)
 * - box-bot-01 の yaw(3D 空間の y 軸回転)への変換は行わない。box-bot-01 のカメラモデルを
 *   知らない疎結合を保つため、呼び出し側(`Stage07`)が `screenAngleToYaw`（box-bot-01 側）
 *   でこの画面角度を yaw へ変換する
 */
export const hexDirectionToScreenAngle = (
  from: HexCell,
  to: HexCell,
): number | undefined => {
  const dq = to.q - from.q
  const dr = to.r - from.r
  const direction = HEX_DIRECTIONS.find((d) => d.q === dq && d.r === dr)

  return direction ? hexDirectionScreenAngle(direction) : undefined
}

/**
 * 矩形グリッドの見た目座標(col, row)を axial 座標へ変換する
 *
 * - flat-top の "odd-q" オフセット方式（奇数列を半セル分ずらす）で対応付ける
 *
 * @param col 列
 * @param row 行
 */
export const colRowToAxial = (col: number, row: number): HexCell => {
  const q = col
  const r = row - (col - (col & 1)) / 2

  return { q, r }
}

/**
 * axial セルが (cols, rows) の矩形グリッドを hex 化した範囲内か判定する
 *
 * - `colRowToAxial` の逆変換(odd-q offset)で col/row を復元し、範囲内か確認する
 */
const isHexCellInGrid = (
  cell: HexCell,
  cols: number,
  rows: number,
): boolean => {
  const col = cell.q
  const row = cell.r + (col - (col & 1)) / 2

  return col >= 0 && col < cols && row >= 0 && row < rows
}

/**
 * 初期向き先のセルを、進入可能(グリッド範囲内)な隣接セルから優先順に選ぶ
 *
 * - `HEX_DIRECTIONS` の並び順で走査し、最初に見つかったグリッド内の隣接セルを返す。
 *   隅セル等で既定の向き先が範囲外(進入不可)のときに使う
 * - 全方向とも範囲外なら `undefined`
 */
export const pickInitialFacingTarget = (
  cell: HexCell,
  cols: number,
  rows: number,
): HexCell | undefined =>
  HEX_DIRECTIONS.map((direction) => ({
    q: cell.q + direction.q,
    r: cell.r + direction.r,
  })).find((target) => isHexCellInGrid(target, cols, rows))
