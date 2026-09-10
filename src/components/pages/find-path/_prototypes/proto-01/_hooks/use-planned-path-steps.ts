import { useCallback } from 'react'

import { usePlannedPathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/planned-path'
import { Position } from '@/prototypes/time-control/time-control-03/types'

/** グリッドセル座標（0-indexed） */
export type Cell = {
  /** 列 */
  col: number
  /** 行 */
  row: number
}

/**
 * セル座標を time-control の自由座標へ載せ替える
 *
 * - find-path はセル単位。tc-03 の `Position {x,y}` に `{x: col, y: row}` で載せる
 */
const toPosition = (cell: Cell): Position => ({ x: cell.col, y: cell.row })

type UsePlannedPathStepsReturn = {
  /** 予定経路の末尾へセルを 1 つ追加する */
  appendStep: (cell: Cell) => void
  /** 予定経路の末尾のセルを 1 つ取り消す（空なら無処理） */
  popStep: () => void
}

/**
 * 予定経路（planned-path）をセル単位で積み下ろしする
 *
 * - tc-03 の `setPlannedPath`（丸ごと差し替え）だけでは「1 セルずつ push / 取り消し」が
 *   書けないため、`getPlannedPath` と組み合わせて append / pop を提供する
 * - tc-03 の planned-path store 自体は無改変。read（表示）は `usePlannedPathStore`
 *   selector を直接使う
 *
 * @param actorId 対象 actor の ID
 */
export const usePlannedPathSteps = (
  actorId: string,
): UsePlannedPathStepsReturn => {
  const api = usePlannedPathStoreApi()

  const appendStep = useCallback(
    (cell: Cell) => {
      const current = api.getState().getPlannedPath(actorId)

      api.getState().setPlannedPath(actorId, [...current, toPosition(cell)])
    },
    [api, actorId],
  )

  const popStep = useCallback(() => {
    const current = api.getState().getPlannedPath(actorId)

    if (current.length === 0) {
      return
    }

    api.getState().setPlannedPath(actorId, current.slice(0, -1))
  }, [api, actorId])

  return { appendStep, popStep }
}
