import { useCallback } from 'react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useStage07EventListener } from '@/prototypes/stage/stage-07/_events'

import { usePlayerActivityStoreApi } from '../../../../../_stores/player-activity'

/**
 * player の移動の開始・停止を行為 store へ記録する
 *
 * - `Stage07-move-start` で移動中、`Stage07-move-stop` で停止中にする
 * - 停止は移動中の場合のみ反映する（補給中の行為を上書きしない）
 */
export const useSetPlayerActivityOnMove = (): void => {
  const playerActivityStoreApi = usePlayerActivityStoreApi()

  useStage07EventListener(
    'Stage07-move-start',
    useCallback(
      (event) => {
        if (event.detail.actorId !== PLAYER_ACTOR_ID) return

        playerActivityStoreApi.getState().setActivity('moving')
      },
      [playerActivityStoreApi],
    ),
    { allowMultiple: true },
  )

  useStage07EventListener(
    'Stage07-move-stop',
    useCallback(
      (event) => {
        /** player の移動が止まったか */
        const isPlayerMoveStop =
          event.detail.actorId === PLAYER_ACTOR_ID &&
          playerActivityStoreApi.getState().activity === 'moving'

        // player 以外、または移動中でない: 何もしない
        if (!isPlayerMoveStop) return

        playerActivityStoreApi.getState().setActivity('idle')
      },
      [playerActivityStoreApi],
    ),
    { allowMultiple: true },
  )
}
