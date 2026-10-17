import { CSSProperties } from 'react'

import { Cell, isAdjacent } from '../../_hooks/use-adjacent-move'
import { START_POSITION } from '../../constants'

type AdjacentMoveLayerProps = {
  /** 列数 */
  cols: number
  /**
   * 斜め方向を隣接として扱うかの初期値（既定 false）
   *
   * - 初期描画（選択可能セルの点線枠）にのみ使う。切替チェックボックスの
   *   `defaultChecked` と揃える。切替後の再計算は `useAdjacentMove` の
   *   `handleDiagonalToggle` が DOM 直書きで行う
   */
  initialAllowDiagonal?: boolean
  /** セルクリック時に呼ぶ（隣接判定・確認ダイアログは呼び出し元で処理済み） */
  onCellClick: (cell: Cell) => void
  /** セル(button)の DOM を登録する。`useAdjacentMove` からそのまま渡す */
  registerCellNode: (cell: Cell, el: HTMLButtonElement | null) => void
  /**
   * セル(button)の DOM を visibility registry へ登録する。`useAdjacentMove`
   * からそのまま渡す
   */
  registerVisibilityNode: (cell: Cell, el: HTMLButtonElement | null) => void
  /** 行数 */
  rows: number
}

/**
 * セル1マスのスタイル。選択可能（隣接）セルのみ点線枠で明示する
 *
 * - `gridColumn`/`gridRow` を明示指定する。CSS Grid の auto-placement は
 *   `display: none` の item を配置計算から除外するため、visibility registry が
 *   大半のセルを非表示にすると、残った可視セルだけが先頭から詰めて再配置されて
 *   しまう（例: (1,0) の隣に本来 (0,1) が来るべきところ、詰まって表示される）
 */
const cellStyle = (
  col: number,
  row: number,
  selectable: boolean,
): CSSProperties => ({
  alignItems: 'center',
  background: 'transparent',
  border: selectable ? '1px dashed #0284c7' : '1px solid transparent',
  cursor: selectable ? 'pointer' : 'default',
  display: 'flex',
  font: 'inherit',
  gridColumn: col + 1,
  gridRow: row + 1,
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
 *   初期描画の選択可能判定は `START_POSITION`（bot の初期セル）・
 *   `initialAllowDiagonal`（斜め切替の初期値）で行う。移動後・切替後の反映は
 *   `registerCellNode` で登録した DOM への直書きに一本化する（このコンポーネント
 *   自体は移動・切替のたびに再レンダリングされない）
 * - 未到達（visibility registry で非可視）のセルは `display: none` にする。
 *   見えないボタンはクリックもできないため、選択不可も同時に達成される
 */
export const AdjacentMoveLayer = (props: AdjacentMoveLayerProps) => {
  const {
    cols,
    initialAllowDiagonal = false,
    onCellClick,
    registerCellNode,
    registerVisibilityNode,
    rows,
  } = props

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
          const selectable = isAdjacent(
            cell,
            START_POSITION,
            initialAllowDiagonal,
          )

          return (
            <button
              aria-label={`${col}-${row} へ移動`}
              key={`${row}-${col}`}
              onClick={() => onCellClick(cell)}
              ref={(el) => {
                registerCellNode(cell, el)
                registerVisibilityNode(cell, el)
              }}
              style={cellStyle(col, row, selectable)}
              type="button"
            />
          )
        }),
      )}
    </div>
  )
}
