import { useCallback } from 'react'

import { useNotifications } from '@/components/ui/notifications'
import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'

import { useFollowPathStoreApi } from '../../../../../../../_stores/follow-path'
import { useGamePhaseStoreApi } from '../../../../../../../_stores/game-phase'
import { useWaypointFlowStoreApi } from '../../../../../../../_stores/waypoint-flow'
import { UseStageReturn } from '../index.types'

/**
 * 自動移動の終了時の処理を返す。途中停止（EN 不足）ならトーストで警告する
 *
 * - 目標・中継点をクリアし経路プレビューを消す。通常は最初の 1 マス移動時に
 *   `handleCellChange` がクリアするが、1 マスも移動せず停止した場合に残るため
 * - 警告を許可しないフェーズ（ゴール後の終了状態。進入不可で停止する）では警告しない
 */
export const useHandleFollowPathEnd =
  (): UseStageReturn['handleFollowPathEnd'] => {
    const followPathStoreApi = useFollowPathStoreApi()
    const waypointFlowStoreApi = useWaypointFlowStoreApi()
    const gamePhaseStoreApi = useGamePhaseStoreApi()
    const addNotification = useNotifications((state) => state.addNotification)

    return useCallback(
      (blockedCell?: HexCell) => {
        followPathStoreApi.getState().end()
        waypointFlowStoreApi.getState().clear()

        /** 途中停止の原因が EN 不足か（警告を許可しないフェーズでの停止を除く） */
        const isBlockedByEnergy =
          blockedCell !== undefined &&
          gamePhaseStoreApi.getState().allows('warnEnergyShortage')

        // 最終セルへ到着、または警告を許可しないフェーズでの停止: 警告しない
        if (!isBlockedByEnergy) {
          return
        }

        addNotification({
          options: { autoDismiss: true },
          title: `EN 不足のため (${blockedCell.q}, ${blockedCell.r}) の手前で停止しました`,
          type: 'warning',
        })
      },
      [
        addNotification,
        followPathStoreApi,
        gamePhaseStoreApi,
        waypointFlowStoreApi,
      ],
    )
  }
