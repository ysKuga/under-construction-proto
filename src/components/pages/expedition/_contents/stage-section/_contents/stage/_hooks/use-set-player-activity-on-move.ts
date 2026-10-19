import { useCallback } from 'react'

import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { useHexStageEventListener } from '@/components/pages/expedition/_stage-components/hex-stage/_events'

import { usePlayerActivityStoreApi } from '../../../../../_stores/player-activity'

/**
 * player の移動の開始・停止を行為 store へ記録する
 *
 * - `HexStage-move-start` で移動中、`HexStage-move-stop` で停止中にする
 * - 停止は移動中の場合のみ反映する（補給中の行為を上書きしない）
 */
export const useSetPlayerActivityOnMove = (): void => {
  const playerActivityStoreApi = usePlayerActivityStoreApi()

  useHexStageEventListener(
    'HexStage-move-start',
    useCallback(
      (event) => {
        if (event.detail.actorId !== PLAYER_ACTOR_ID) return

        playerActivityStoreApi.getState().setActivity('moving')
      },
      [playerActivityStoreApi],
    ),
    { allowMultiple: true },
  )

  useHexStageEventListener(
    'HexStage-move-stop',
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
