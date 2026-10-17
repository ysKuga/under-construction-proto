import { useEnergyEventListener } from '@/components/pages/expedition/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useMoveHistoryStoreApi } from '../../../../../_stores/move-history'

/**
 * player の EN 切れを手数の履歴へ記録する
 *
 * - 移動による消費・デバッグ操作のどちらの EN 切れも `Energy-depleted` を購読して拾う。\
 *   EN 切れ演出等と同じイベントのため、`allowMultiple` で購読する
 */
export const useRecordHistoryOnEnergyDepleted = (): void => {
  const moveHistoryStoreApi = useMoveHistoryStoreApi()

  useEnergyEventListener(
    'Energy-depleted',
    (event) => {
      // player 以外の EN 切れ: 履歴は player の行動の記録のため対象外
      if (event.detail.actorId !== PLAYER_ACTOR_ID) {
        return
      }

      moveHistoryStoreApi.getState().record({ kind: 'energy-depleted' })
    },
    { allowMultiple: true },
  )
}
