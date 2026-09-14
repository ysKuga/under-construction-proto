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
const HEX_DIRECTIONS: readonly HexCell[] = [
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
