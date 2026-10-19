import { useCallback } from 'react'

import { useHexStageEventListener } from '@/components/pages/expedition/_stage-components/hex-stage/_events'
import { Actor } from '@/types/theater/actor'

import { useStageLayout } from '../../../../../_contexts/stage-layout'
import { useGamePhaseStoreApi } from '../../../../../_stores/game-phase'

/**
 * actor がゴールセルの中心へ着いたら、フェーズを `cleared` へ進める
 *
 * - `HexStage-cell-reach` を購読し、game-phase store の `arriveAtGoal` を呼ぶ
 * - ゴール判定（`reachGoal`）はセル進入時のため、ゴールの演出は bot が見た目上ゴールへ
 *   着くまで待つ
 * - `clearing` でなければ `arriveAtGoal` は何もしない
 *
 * @param actorId 対象 actor
 */
export const useArriveAtGoalOnCellReach = (actorId: Actor['id']) => {
  const gamePhaseStoreApi = useGamePhaseStoreApi()
  const { goal } = useStageLayout()

  useHexStageEventListener(
    'HexStage-cell-reach',
    useCallback(
      (event) => {
        const { cell } = event.detail

        /** 対象 actor がゴールセルの中心へ着いたか */
        const isGoalReach =
          event.detail.actorId === actorId &&
          cell.q === goal.q &&
          cell.r === goal.r

        // ゴール以外への到達: 何もしない
        if (!isGoalReach) return

        gamePhaseStoreApi.getState().arriveAtGoal()
      },
      [actorId, gamePhaseStoreApi, goal],
    ),
    // 自動移動の進行・移動可能マスの表示が同じイベントを購読するため
    { allowMultiple: true },
  )
}
