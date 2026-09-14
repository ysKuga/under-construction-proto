import { CSSProperties } from 'react'

import { colRowToAxial, HexCell, isHexAdjacent } from '../../_lib/hex'
import { axialToPixel, HEX_CLIP_PATH } from '../../_lib/hex-layout'

type GeoLayerProps = {
  /** 列数 */
  cols: number
  /** 現在地セル。隣接セルの選択可能表示・強調表示に使う */
  currentCell: HexCell
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /** セルクリック時。隣接判定は呼び出し元（`useHexMove`）が行う */
  onCellClick: (cell: HexCell) => void
  /** 行数 */
  rows: number
}

/**
 * hex 地形 layer
 *
 * - 矩形グリッド(col, row)を axial 座標へ変換し、flat-top 六角形として
 *   absolute 配置する（CSS Grid は hex オフセットに乗らないため不使用）
 * - 現在地に隣接するセルのみ点線枠で選択可能を明示する
 */
export const GeoLayer = (props: GeoLayerProps) => {
  const { cols, currentCell, hexSize, onCellClick, rows } = props

  const cellWidth = hexSize * 2
  const cellHeight = hexSize * Math.sqrt(3)

  const cells = Array.from({ length: rows }).flatMap((_, row) =>
    Array.from({ length: cols }).map((_, col) => {
      const axial = colRowToAxial(col, row)

      return { axial, pixel: axialToPixel(axial, hexSize) }
    }),
  )

  const xs = cells.map((cell) => cell.pixel.x)
  const ys = cells.map((cell) => cell.pixel.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)

  const containerStyle: CSSProperties = {
    height: Math.max(...ys) - minY + cellHeight,
    position: 'relative',
    width: Math.max(...xs) - minX + cellWidth,
  }

  return (
    <div style={containerStyle}>
      {cells.map(({ axial, pixel }) => {
        const isCurrent = axial.q === currentCell.q && axial.r === currentCell.r
        const selectable = isHexAdjacent(currentCell, axial)

        const cellStyle: CSSProperties = {
          backgroundColor: isCurrent ? '#0284c7' : '#f1f5f9',
          border: selectable ? '2px dashed #0284c7' : '1px solid #cbd5e1',
          boxSizing: 'border-box',
          clipPath: HEX_CLIP_PATH,
          cursor: selectable ? 'pointer' : 'default',
          height: cellHeight,
          left: pixel.x - minX + cellWidth / 2,
          position: 'absolute',
          top: pixel.y - minY + cellHeight / 2,
          transform: 'translate(-50%, -50%)',
          width: cellWidth,
        }

        return (
          <button
            aria-label={`hex ${axial.q}-${axial.r}`}
            key={`${axial.q}-${axial.r}`}
            onClick={() => onCellClick(axial)}
            style={cellStyle}
            type="button"
          />
        )
      })}
    </div>
  )
}
