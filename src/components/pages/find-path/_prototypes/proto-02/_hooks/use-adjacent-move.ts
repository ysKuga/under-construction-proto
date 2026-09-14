import { useCallback, useState } from 'react'

import { useActorNodeRegistry } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { GOAL_POSITION } from '../../proto-01/constants'
import { START_POSITION } from '../constants'

/** グリッドセル座標 (0-indexed) */
export type Cell = {
  /** 列 */
  col: number
  /** 行 */
  row: number
}

/** 2 マスが上下左右で隣接しているか（斜めは含まない） */
export const isAdjacent = (a: Cell, b: Cell): boolean =>
  Math.abs(a.col - b.col) + Math.abs(a.row - b.row) === 1

type UseAdjacentMoveReturn = {
  /** セルクリック前に確認ダイアログを挟むか */
  confirmRequired: boolean
  /** bot の現在セル */
  currentCell: Cell
  /**
   * セルクリックのハンドラ
   *
   * - `currentCell` に隣接しないセルは無視する
   * - `confirmRequired` が true のときは確認ダイアログを挟み、OK でのみ移動する
   */
  handleCellClick: (cell: Cell) => void
  /** bot が `GOAL_POSITION` に到達済みか */
  reachedGoal: boolean
  /** `confirmRequired` を切り替える */
  setConfirmRequired: (value: boolean) => void
}

/**
 * 隣接セルクリックで bot を都度 1 手ずつ即時移動する
 *
 * - proto-01（`planned-path` へ積み上げ→まとめて「実行」）とは別方式の試作。
 *   積み上げ・tick ループを持たず、クリックのたびに移動を確定する
 * - 配線: セルクリック(event) → 隣接判定 → (`confirmRequired` なら確認ダイアログ) →
 *   `moveActor`(DOM 直書き) + `currentCell`(state) 更新
 * - 「戻る」（直前セルへの逆戻り）も隣接クリックとして自然に許容される。
 *   proto-01 で課題だった同一セル重複選択の概念自体が発生しない
 */
export const useAdjacentMove = (): UseAdjacentMoveReturn => {
  const { moveActor } = useActorNodeRegistry()

  const [currentCell, setCurrentCell] = useState<Cell>(START_POSITION)
  const [confirmRequired, setConfirmRequired] = useState(false)
  const [reachedGoal, setReachedGoal] = useState(false)

  const handleCellClick = useCallback(
    (cell: Cell) => {
      if (!isAdjacent(cell, currentCell)) {
        return
      }

      if (
        confirmRequired &&
        !window.confirm(`${cell.col}-${cell.row} へ移動する？`)
      ) {
        return
      }

      moveActor(PLAYER_ACTOR_ID, cell)
      setCurrentCell(cell)
      setReachedGoal(
        cell.col === GOAL_POSITION.col && cell.row === GOAL_POSITION.row,
      )
    },
    [confirmRequired, currentCell, moveActor],
  )

  return {
    confirmRequired,
    currentCell,
    handleCellClick,
    reachedGoal,
    setConfirmRequired,
  }
}
