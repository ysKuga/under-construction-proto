import {
  GridPosition,
  GridSize,
} from '../../stage-04/_contexts/actor-position-context'

/** 遠近投影のレイアウト指定 */
export type PerspectiveViewport = {
  /** 最奥行のセル倍率 (最前行を 1 とした相対値、0-1) */
  depthScale: number
  /** 描画領域の高さ (px) */
  height: number
  /** 描画領域の幅 (px) */
  width: number
}

/** セル 1 個の投影結果 (px) */
export type ProjectedCell = {
  /** 左端座標 */
  left: number
  /** 最前行を 1 とした縮尺 (actor の大きさ指定に流用) */
  scale: number
  /** 一辺の長さ */
  size: number
  /** 上端座標 */
  top: number
}

const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t

/**
 * グリッド座標を遠近付きの画面座標へ投影する
 *
 * - 最奥行 (row 0) を `depthScale` 倍、最前行 (row rows-1) を等倍として線形補間する
 * - 各行は水平中央揃え。縦は各行のセル高を奥から積み上げ、行間の隙間なくタイル状に並べる
 * - 経路探索・境界処理は行わない。呼び出し側が確定した col/row をそのまま投影する
 *
 * @param position 投影するグリッド座標
 * @param gridSize グリッドの形状
 * @param viewport 描画領域と遠近の強さ
 */
export const projectCell = (
  position: GridPosition,
  gridSize: GridSize,
  viewport: PerspectiveViewport,
): ProjectedCell => {
  const { depthScale, width } = viewport
  const rowDenom = Math.max(gridSize.rows - 1, 1)

  const rowSize = (row: number): number =>
    (width / gridSize.cols) * lerp(depthScale, 1, row / rowDenom)

  const top = Array.from({ length: position.row }).reduce<number>(
    (sum, _, row) => sum + rowSize(row),
    0,
  )

  const size = rowSize(position.row)
  const rowWidth = size * gridSize.cols

  return {
    left: (width - rowWidth) / 2 + position.col * size,
    scale: lerp(depthScale, 1, position.row / rowDenom),
    size,
    top,
  }
}
