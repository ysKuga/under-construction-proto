import { useCallback, useRef } from 'react'

import { useEnergyStoreApi } from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { useHexStageEventListener } from '@/components/pages/expedition/_stage-components/hex-stage/_events'

import { useReset } from '../../../../../../../_contexts/reset'
import { useExpeditionEventListener } from '../../../../../../../_events'
import { useMoveHistoryStoreApi } from '../../../../../../../_stores/move-history'
import { usePlayerActivityStoreApi } from '../../../../../../../_stores/player-activity'

/**
 * チェックポイント（開始位置）へのリセットを受け付け、盤面ごと初期状態へ戻す
 *
 * - EN 切れ中かつ停止中でなければ `preventDefault()` で拒否する
 *   - 停止中かは `HexStage-move-start`/`HexStage-move-stop` の購読で知る
 *   - EN スポットで補給中も拒否する（issue #297）
 * - 受け付けたら `useReset` で配下を丸ごと再マウントする（issue #315）\
 *   位置・EN・アイテム・霧等の全 store が初期状態へ戻る。seed は保持されるため盤面は同じ配置
 * - 受け付けたリセットは手数の履歴へ記録する（履歴は再マウント対象の外のため残る）
 */
export const useResetToCheckpointEventListener = (): void => {
  const energy = useEnergyStoreApi()
  const moveHistoryStoreApi = useMoveHistoryStoreApi()
  const playerActivityStoreApi = usePlayerActivityStoreApi()
  const reset = useReset()
  /** player が移動中か */
  const isMovingRef = useRef(false)

  useHexStageEventListener(
    'HexStage-move-start',
    useCallback((event) => {
      if (event.detail.actorId !== PLAYER_ACTOR_ID) return

      isMovingRef.current = true
    }, []),
    { allowMultiple: true },
  )

  useHexStageEventListener(
    'HexStage-move-stop',
    useCallback((event) => {
      if (event.detail.actorId !== PLAYER_ACTOR_ID) return

      isMovingRef.current = false
    }, []),
    { allowMultiple: true },
  )

  useExpeditionEventListener('Expedition-reset-to-checkpoint', (event) => {
    const { current } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    /** EN 切れ中かつ停止中（補給中でない）か（リセットを提示する状況） */
    const isAcceptable =
      current <= 0 &&
      !isMovingRef.current &&
      playerActivityStoreApi.getState().activity !== 'charging'

    // EN が残っている、移動中、または補給中: リセットを拒否する
    if (!isAcceptable) {
      event.preventDefault()

      return
    }

    moveHistoryStoreApi.getState().record({ kind: 'reset' })
    reset()
  })
}
