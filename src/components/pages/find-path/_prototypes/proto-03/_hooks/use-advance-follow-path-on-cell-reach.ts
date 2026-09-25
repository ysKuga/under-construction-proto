import { useCallback } from 'react'

import { useStage07EventListener } from '@/prototypes/stage/stage-07/_events'
import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { useFollowPathStoreApi } from '../_stores/follow-path'

/**
 * actor がセル中心に到達したら、自動移動の進行を記録する
 *
 * - `Stage07-cell-reach` を購読し、follow-path store の `advance` を呼ぶ。経路
 *   プレビューの点が、bot がそのマスの中心に着いた時点で消えるようにするため
 * - 進入開始時（`onCellChange`）に数えると、移動を始めた時点で点が消えてしまう
 * - 自動移動中でなければ `advance` は何もしない（マウント時・停止時の到達通知は無視される）
 *
 * @param actorId 対象 actor
 */
export const useAdvanceFollowPathOnCellReach = (actorId: ActorId) => {
  const followPathStoreApi = useFollowPathStoreApi()

  useStage07EventListener(
    'Stage07-cell-reach',
    useCallback(
      (event) => {
        if (event.detail.actorId !== actorId) return

        followPathStoreApi.getState().advance()
      },
      [actorId, followPathStoreApi],
    ),
  )
}
