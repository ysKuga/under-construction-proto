import { type RefObject, useCallback, useRef } from 'react'

import { useActorNodeRegistry } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { GOAL_POSITION } from '../../proto-01/constants'
import { useVisibilityRegistry } from '../_contexts/visibility-registry'
import { START_POSITION } from '../constants'

/** グリッドセル座標 (0-indexed) */
export type Cell = {
  /** 列 */
  col: number
  /** 行 */
  row: number
}

/** グリッドの形状 */
export type GridSize = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/** セルキー ("col,row") を組み立てる */
const cellKey = (cell: Cell): string => `${cell.col},${cell.row}`

/** 2 マスが上下左右で隣接しているか（斜めは含まない） */
export const isAdjacent = (a: Cell, b: Cell): boolean =>
  Math.abs(a.col - b.col) + Math.abs(a.row - b.row) === 1

/** cell の上下左右のうちグリッド内に収まるセルを返す */
const neighborsOf = (cell: Cell, gridSize: GridSize): Cell[] =>
  [
    { col: cell.col - 1, row: cell.row },
    { col: cell.col + 1, row: cell.row },
    { col: cell.col, row: cell.row - 1 },
    { col: cell.col, row: cell.row + 1 },
  ].filter(
    (c) =>
      c.col >= 0 &&
      c.col < gridSize.cols &&
      c.row >= 0 &&
      c.row < gridSize.rows,
  )

/**
 * セル(button)の選択可能状態を DOM 直書きで反映する
 *
 * - `disabled` プロパティは書き換えない（React が `disabled` プロパティ由来で
 *   合成クリックイベントの発火判定をネイティブ DOM 側の状態と食い違わせるらしく、
 *   直書きで disabled を外した後のクリックが React 側へ届かなくなる事象を確認した
 *   ため）。選択不可の判定は `handleCellClick` 側の `isAdjacent` ガードに一本化し、
 *   ここでは見た目（枠線・カーソル）のみ切り替える
 */
const applySelectable = (
  node: HTMLButtonElement | undefined,
  selectable: boolean,
) => {
  if (!node) {
    return
  }

  node.style.border = selectable
    ? '1px dashed #0284c7'
    : '1px solid transparent'
  node.style.cursor = selectable ? 'pointer' : 'default'
}

type UseAdjacentMoveReturn = {
  /** 確認チェックボックス（非制御）。クリック時に `.checked` を直接読む */
  confirmCheckboxRef: RefObject<HTMLInputElement | null>
  /** ゴール到達メッセージの DOM。到達状態を `hidden` の直書きで反映する */
  goalMessageRef: RefObject<HTMLSpanElement | null>
  /**
   * セルクリックのハンドラ
   *
   * - 現在セルに隣接しないセルは無視する
   * - 確認チェックボックスが ON のときは確認ダイアログを挟み、OK でのみ移動する
   */
  handleCellClick: (cell: Cell) => void
  /** セル(button)の DOM を登録する。JSX の `ref` コールバックから呼ぶ */
  registerCellNode: (cell: Cell, el: HTMLButtonElement | null) => void
  /**
   * セル(button)の DOM を visibility registry へ登録する
   *
   * - JSX の `ref` コールバックから呼ぶ。未到達マスは `display: none` になり、
   *   クリックも自然に不可になる
   */
  registerVisibilityNode: (cell: Cell, el: HTMLButtonElement | null) => void
}

/**
 * 隣接セルクリックで bot を都度 1 手ずつ即時移動する
 *
 * - proto-01（`planned-path` へ積み上げ→まとめて「実行」）とは別方式の試作。
 *   積み上げ・tick ループを持たず、クリックのたびに移動を確定する
 * - **`useState` を持たない**。現在セル・確認要否・ゴール到達のいずれも ref で
 *   保持し、見た目の反映は DOM 直書きで行う（`ActorNodeRegistryProvider` /
 *   `PlannedPathCellRegistryProvider` と同じ狙い。移動のたびに `Stage06` 配下
 *   全体が再レンダリングされていた問題を解消する）
 * - 配線: セルクリック(event) → 隣接判定 → (確認チェックボックスが ON なら
 *   確認ダイアログ) → `moveActor` + `markVisited`(いずれも DOM 直書き) + 選択可能
 *   セルの border/disabled を DOM 直書きで更新
 * - 「戻る」（直前セルへの逆戻り）も隣接クリックとして自然に許容される。
 *   proto-01 で課題だった同一セル重複選択の概念自体が発生しない
 *
 * @param gridSize グリッドの形状（隣接セル計算の境界に使う）
 */
export const useAdjacentMove = (gridSize: GridSize): UseAdjacentMoveReturn => {
  const { moveActor } = useActorNodeRegistry()
  const { markVisited, registerVisibilityNode } = useVisibilityRegistry()

  const cellNodesRef = useRef(new Map<string, HTMLButtonElement>())
  const currentCellRef = useRef<Cell>(START_POSITION)
  const confirmCheckboxRef = useRef<HTMLInputElement>(null)
  const goalMessageRef = useRef<HTMLSpanElement>(null)

  const registerCellNode = useCallback(
    (cell: Cell, el: HTMLButtonElement | null) => {
      const key = cellKey(cell)

      if (el === null) {
        cellNodesRef.current.delete(key)

        return
      }

      cellNodesRef.current.set(key, el)
    },
    [],
  )

  const registerSelectVisibilityNode = useCallback(
    (cell: Cell, el: HTMLButtonElement | null) => {
      registerVisibilityNode(cell, 'select', el)
    },
    [registerVisibilityNode],
  )

  const handleCellClick = useCallback(
    (cell: Cell) => {
      if (!isAdjacent(cell, currentCellRef.current)) {
        return
      }

      const confirmRequired = confirmCheckboxRef.current?.checked ?? false

      if (
        confirmRequired &&
        !window.confirm(`${cell.col}-${cell.row} へ移動する？`)
      ) {
        return
      }

      const prevCell = currentCellRef.current

      neighborsOf(prevCell, gridSize).forEach((neighbor) => {
        applySelectable(cellNodesRef.current.get(cellKey(neighbor)), false)
      })

      currentCellRef.current = cell

      neighborsOf(cell, gridSize).forEach((neighbor) => {
        applySelectable(cellNodesRef.current.get(cellKey(neighbor)), true)
      })

      moveActor(PLAYER_ACTOR_ID, cell)
      markVisited(cell)

      if (goalMessageRef.current) {
        goalMessageRef.current.hidden = !(
          cell.col === GOAL_POSITION.col && cell.row === GOAL_POSITION.row
        )
      }
    },
    [gridSize, moveActor, markVisited],
  )

  return {
    confirmCheckboxRef,
    goalMessageRef,
    handleCellClick,
    registerCellNode,
    registerVisibilityNode: registerSelectVisibilityNode,
  }
}
