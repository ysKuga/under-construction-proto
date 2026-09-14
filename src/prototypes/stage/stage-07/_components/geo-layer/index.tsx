import { CSSProperties } from 'react'

import { colRowToAxial, HexCell, isHexAdjacent } from '../../_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
  hexPolygonPoints,
} from '../../_lib/hex-layout'

/**
 * セル間の隙間を作るための縮小率
 *
 * - 六角形本体を外接円半径のこの比率まで縮小して描画する。全辺同じ比率で
 *   縮めるため、隙間の太さが方向によらず均等になる
 */
const HEX_INSET_RATIO = 0.94

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
 * - 六角形本体は SVG `polygon` で描画する。`border` + `clip-path` の組合せは
 *   辺の角度によって線の実効太さが変わりセル間の隙間が不均一に見えたため、
 *   幾何学的に正確な頂点座標を計算する SVG 方式へ変更（issue #162）
 * - 現在地に隣接するセルのみ点線枠で選択可能を明示する。現在地自体は
 *   `ActorsLayer` の box-bot が示すため、セル側でのハイライトは行わない（stage-06 と同一方針）
 */
export const GeoLayer = (props: GeoLayerProps) => {
  const { cols, currentCell, hexSize, onCellClick, rows } = props

  const bounds = computeHexGridBounds(cols, rows, hexSize)

  const cells = Array.from({ length: rows }).flatMap((_, row) =>
    Array.from({ length: cols }).map((_, col) => colRowToAxial(col, row)),
  )

  const containerStyle: CSSProperties = {
    height: bounds.containerHeight,
    position: 'relative',
    width: bounds.containerWidth,
  }

  return (
    <div style={containerStyle}>
      {cells.map((axial) => {
        const selectable = isHexAdjacent(currentCell, axial)
        const center = hexCellCenter(axial, hexSize, bounds)

        const buttonStyle: CSSProperties = {
          background: 'transparent',
          border: 'none',
          cursor: selectable ? 'pointer' : 'default',
          height: bounds.cellHeight,
          left: center.x,
          padding: 0,
          position: 'absolute',
          top: center.y,
          transform: 'translate(-50%, -50%)',
          width: bounds.cellWidth,
        }

        return (
          <button
            aria-label={`hex ${axial.q}-${axial.r}`}
            key={`${axial.q}-${axial.r}`}
            onClick={() => onCellClick(axial)}
            style={buttonStyle}
            type="button"
          >
            <svg height={bounds.cellHeight} width={bounds.cellWidth}>
              <polygon
                fill="#f1f5f9"
                points={hexPolygonPoints(hexSize, HEX_INSET_RATIO)}
                stroke={selectable ? '#0284c7' : 'none'}
                strokeDasharray={selectable ? '4 3' : undefined}
                strokeWidth={selectable ? 2 : 0}
              />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
