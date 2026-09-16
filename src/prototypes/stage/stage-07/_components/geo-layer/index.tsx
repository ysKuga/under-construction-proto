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
 * - `MoveTargetLayer`（find-path proto-03）が選択可能マスの点線枠を同じ縮小率で
 *   描画するために export する
 */
export const HEX_INSET_RATIO = 0.94

type GeoLayerProps = {
  /**
   * 対象セルへ進入可能か（省略時は常に進入可能）
   *
   * - 選択可能表示（`cursor: pointer`）の判定にのみ使う。実際の進入拒否は
   *   呼び出し元（`useHexMove`）が行う
   */
  canEnterCell?: (cell: HexCell) => boolean
  /** 列数 */
  cols: number
  /** 現在地セル。隣接セルの選択可能表示・強調表示に使う */
  currentCell: HexCell
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /**
   * セルクリックで actor を移動させるか
   *
   * - `false` の場合はセルを非対話の `<div>` で描画する（find-path proto-03 の
   *   tick 駆動実行のように、クリックを別レイヤー（予定経路レイヤー）へ
   *   委ねたいとき使う）
   */
  interactive: boolean
  /** セルクリック時。隣接判定は呼び出し元（`useHexMove`）が行う */
  onCellClick: (cell: HexCell) => void
  /**
   * セル(button)の DOM を visibility registry 等へ登録する
   *
   * - 省略時は登録しない（常時表示）。渡した場合、呼び出し元の可視判定に
   *   従って hex タイル自体の表示/非表示が切り替わる（find-path proto-03 で使用）
   */
  registerVisibilityNode?: (cell: HexCell, el: HTMLElement | null) => void
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
 * - 選択可能マスの点線枠表示は `MoveTargetLayer`（find-path proto-03）へ委譲する。
 *   ここでは隣接セルの `cursor: pointer` のみ付与する
 * - `interactive=false` のセルは非対話の `<div>` で描画する（stage-06 の
 *   `GeoLayer` と同じ方針）
 */
export const GeoLayer = (props: GeoLayerProps) => {
  const {
    canEnterCell,
    cols,
    currentCell,
    hexSize,
    interactive,
    onCellClick,
    registerVisibilityNode,
    rows,
  } = props

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
        const selectable =
          isHexAdjacent(currentCell, axial) && (canEnterCell?.(axial) ?? true)
        const center = hexCellCenter(axial, hexSize, bounds)

        const cellStyle: CSSProperties = {
          background: 'transparent',
          border: 'none',
          height: bounds.cellHeight,
          left: center.x,
          padding: 0,
          position: 'absolute',
          top: center.y,
          transform: 'translate(-50%, -50%)',
          width: bounds.cellWidth,
        }

        const hexagon = (
          <svg height={bounds.cellHeight} width={bounds.cellWidth}>
            <polygon
              fill="#f1f5f9"
              points={hexPolygonPoints(hexSize, HEX_INSET_RATIO)}
            />
          </svg>
        )

        return interactive ? (
          <button
            aria-label={`hex ${axial.q}-${axial.r}`}
            key={`${axial.q}-${axial.r}`}
            onClick={() => onCellClick(axial)}
            ref={(el) => registerVisibilityNode?.(axial, el)}
            style={{ ...cellStyle, cursor: selectable ? 'pointer' : 'default' }}
            type="button"
          >
            {hexagon}
          </button>
        ) : (
          <div
            key={`${axial.q}-${axial.r}`}
            ref={(el) => registerVisibilityNode?.(axial, el)}
            style={cellStyle}
          >
            {hexagon}
          </div>
        )
      })}
    </div>
  )
}
