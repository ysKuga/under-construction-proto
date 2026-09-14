'use client'

import { GeoLayer } from './_components/geo-layer'
import { useHexMove } from './_hooks/use-hex-move'
import { HexCell } from './_lib/hex'

type Stage07Props = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /** 初期の現在地セル（省略時は axial 原点 (0, 0)） */
  initialCell?: HexCell
  /** 行数 */
  rows: number
}

/**
 * 舞台 (stage) — hex グリッド試作版
 *
 * - CSS Grid を使わず、矩形(col, row)を axial 座標へ変換した flat-top 六角形を
 *   absolute 配置する（issue #162）
 * - 到達点は「六角セル描画 + クリックで隣接移動」まで。visibility / time-control
 *   統合、遠近表現（stage-05/06 の perspective + rotateX）との組合せは対象外
 */
export const Stage07 = (props: Stage07Props) => {
  const { cols, hexSize, initialCell = { q: 0, r: 0 }, rows } = props

  const { currentCell, handleCellClick } = useHexMove(initialCell)

  return (
    <GeoLayer
      cols={cols}
      currentCell={currentCell}
      hexSize={hexSize}
      onCellClick={handleCellClick}
      rows={rows}
    />
  )
}
