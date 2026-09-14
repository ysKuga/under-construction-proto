import { CSSProperties } from 'react'

import { Cell, isAdjacent } from '../../_hooks/use-adjacent-move'

type AdjacentMoveLayerProps = {
  /** 列数 */
  cols: number
  /** bot の現在セル */
  currentCell: Cell
  /** セルクリック時に呼ぶ（隣接判定・確認ダイアログは呼び出し元で処理済み） */
  onCellClick: (cell: Cell) => void
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
 *   `currentCell` に隣接するセルのみ点線枠で選択可能を明示し、クリックを
 *   `onCellClick` へ渡す（非隣接セルは `disabled` でクリック自体を無効化）
 */
export const AdjacentMoveLayer = (props: AdjacentMoveLayerProps) => {
  const { cols, currentCell, onCellClick, rows } = props

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
          const selectable = isAdjacent({ col, row }, currentCell)

          return (
            <button
              aria-label={`${col}-${row} へ移動`}
              disabled={!selectable}
              key={`${row}-${col}`}
              onClick={() => onCellClick({ col, row })}
              style={cellStyle(selectable)}
              type="button"
            />
          )
        }),
      )}
    </div>
  )
}
