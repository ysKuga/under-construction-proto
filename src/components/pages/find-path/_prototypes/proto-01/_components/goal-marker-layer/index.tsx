import { CSSProperties } from 'react'

import { GOAL_POSITION } from '../../constants'

type GoalMarkerLayerProps = {
  /** 列数 */
  cols: number
  /**
   * ゴールセルの表示切替 DOM を visibility registry へ登録する
   *
   * - 省略時は常時表示（`VisibilityRegistryProvider` を持たない利用元向け）。
   *   渡した場合は到達済みマスへ隣接するまで旗が非表示になる（proto-02 で使用）
   */
  registerVisibilityNode?: (
    cell: { col: number; row: number },
    el: HTMLElement | null,
  ) => void
  /** 行数 */
  rows: number
}

/** セル1マスのスタイル */
const cellStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  fontSize: 20,
  justifyContent: 'center',
}

/**
 * ゴールセルの表示レイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   `GOAL_POSITION` のセルにマーカーを表示するだけの非対話層
 * - `pointerEvents: none` でクリックを下層（`PlannedPathLayer`）へ通す
 * - `registerVisibilityNode` 経由でゴールセルの DOM を visibility registry へ登録する
 *   （渡された場合のみ）。可視状態の反映は registry 側の DOM 直書きに任せるため、
 *   ここでは再レンダリングを起こさない
 */
export const GoalMarkerLayer = (props: GoalMarkerLayerProps) => {
  const { cols, registerVisibilityNode, rows } = props

  const overlayStyle: CSSProperties = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute',
  }

  return (
    <div style={overlayStyle}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const isGoal = col === GOAL_POSITION.col && row === GOAL_POSITION.row

          return (
            <div
              key={`${row}-${col}`}
              ref={
                isGoal
                  ? (el) => registerVisibilityNode?.({ col, row }, el)
                  : undefined
              }
              style={cellStyle}
            >
              {isGoal ? '🚩' : ''}
            </div>
          )
        }),
      )}
    </div>
  )
}
