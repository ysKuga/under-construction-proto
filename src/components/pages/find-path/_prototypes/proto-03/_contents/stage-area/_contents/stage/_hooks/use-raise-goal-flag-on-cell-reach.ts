import { useCallback } from 'react'

import { useStage07EventListener } from '@/prototypes/stage/stage-07/_events'
import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { useStageLayout } from '../../../../../_contexts/stage-layout'
import { useGoalStoreApi } from '../../../../../_stores/goal'

/**
 * actor がゴールセルの中心へ着いたら、旗を頭上へ掲げる
 *
 * - `Stage07-cell-reach` を購読し、goal store の `raiseFlag` を呼ぶ
 * - 到達判定（`reach`）はセル進入時のため、旗の演出は bot が見た目上ゴールへ着くまで待つ
 * - 未到達なら `raiseFlag` は何もしない
 *
 * @param actorId 対象 actor
 */
export const useRaiseGoalFlagOnCellReach = (actorId: ActorId) => {
  const goalStoreApi = useGoalStoreApi()
  const { goal } = useStageLayout()

  useStage07EventListener(
    'Stage07-cell-reach',
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

        goalStoreApi.getState().raiseFlag()
      },
      [actorId, goal, goalStoreApi],
    ),
    // 自動移動の進行・移動可能マスの表示が同じイベントを購読するため
    { allowMultiple: true },
  )
}
