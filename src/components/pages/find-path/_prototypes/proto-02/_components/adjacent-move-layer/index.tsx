import { CSSProperties } from 'react'

import { Cell, isAdjacent } from '../../_hooks/use-adjacent-move'
import { START_POSITION } from '../../constants'

type AdjacentMoveLayerProps = {
  /** 列数 */
  cols: number
  /** セルクリック時に呼ぶ（隣接判定・確認ダイアログは呼び出し元で処理済み） */
  onCellClick: (cell: Cell) => void
  /** セル(button)の DOM を登録する。`useAdjacentMove` からそのまま渡す */
  registerCellNode: (cell: Cell, el: HTMLButtonElement | null) => void
  /** 行数 */
  rows: number
}

/** セル1マスのスタイル。選択可能（隣接）セルのみ点線枠で明示する */
const cellStyle = (selectable: boolean): CSSProperties => ({
  alignItems: 'center',
  background: 'transparent',
  border: selectable ? '1px dashed #0284c7' : '1px solid transparent',
  cursor: selectable ? 'pointer' : 'default',
  display: 'flex',
  font: 'inherit',
  justifyContent: 'center',
  padding: 0,
  position: 'relative',
})

/**
 * 隣接セルクリックレイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   bot の現在セルに隣接するセルのみ点線枠で選択可能を明示し、クリックを
 *   `onCellClick` へ渡す
 * - `disabled` 属性は使わない。React が `disabled` プロパティを DOM へ反映した
 *   セルは、その後 DOM 直書きで disabled を外してもクリックイベントが React へ
 *   届かなくなる事象を確認したため。選択不可の判定は `onCellClick` の呼び先
 *   （`handleCellClick`）の `isAdjacent` ガードへ一本化する
 * - 現在セルは React state を持たず `useAdjacentMove` が ref で保持するため、
 *   初期描画の選択可能判定は `START_POSITION`（bot の初期セル）で行う。
 *   移動後の切替は `registerCellNode` で登録した DOM への直書きに一本化する
 *   （このコンポーネント自体は移動のたびに再レンダリングされない）
 */
export const AdjacentMoveLayer = (props: AdjacentMoveLayerProps) => {
  const { cols, onCellClick, registerCellNode, rows } = props

  const overlayStyle: CSSProperties = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    inset: 0,
    position: 'absolute',
  }

  return (
    <div style={overlayStyle}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const cell = { col, row }
          const selectable = isAdjacent(cell, START_POSITION)

          return (
            <button
              aria-label={`${col}-${row} へ移動`}
              key={`${row}-${col}`}
              onClick={() => onCellClick(cell)}
              ref={(el) => registerCellNode(cell, el)}
              style={cellStyle(selectable)}
              type="button"
            />
          )
        }),
      )}
    </div>
  )
}
