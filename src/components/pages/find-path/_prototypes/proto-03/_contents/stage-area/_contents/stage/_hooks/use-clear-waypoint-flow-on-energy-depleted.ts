import { useEnergyEventListener } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useWaypointFlowStoreApi } from '../../../../../_stores/waypoint-flow'

/**
 * player の EN 切れで目標設定（中継点フロー）をキャンセルし、吹き出しを消す
 *
 * - EN 切れでは経路を実行できないため、目標・中継点ごと通常状態へ戻す
 * - 移動による消費・デバッグ操作のどちらの EN 切れも `Energy-depleted` を購読して拾う。\
 *   EN 切れ演出（予防姿勢）と同じイベントのため、`allowMultiple` で購読する
 */
export const useClearWaypointFlowOnEnergyDepleted = (): void => {
  const waypointFlowStoreApi = useWaypointFlowStoreApi()

  useEnergyEventListener(
    'Energy-depleted',
    (event) => {
      // player 以外の EN 切れ: 目標設定は player 専用のため対象外
      if (event.detail.actorId !== PLAYER_ACTOR_ID) {
        return
      }

      waypointFlowStoreApi.getState().clear()
    },
    { allowMultiple: true },
  )
}
