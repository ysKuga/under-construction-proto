import { useCallback } from 'react'

import { useNotifications } from '@/components/ui/notifications'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { useFollowPathStoreApi } from '../../../../../_stores/follow-path'
import { useGoalStoreApi } from '../../../../../_stores/goal'
import { useWaypointFlowStoreApi } from '../../../../../_stores/waypoint-flow'
import { UseStageReturn } from '../index.types'

/**
 * 自動移動の終了時の処理を返す。途中停止（EN 不足）ならトーストで警告する
 *
 * - 目標・中継点をクリアし経路プレビューを消す。通常は最初の 1 マス移動時に
 *   `handleCellChange` がクリアするが、1 マスも移動せず停止した場合に残るため
 * - ゴール到達による停止（到達後は進入不可）は警告しない
 */
export const useHandleFollowPathEnd =
  (): UseStageReturn['handleFollowPathEnd'] => {
    const followPathStoreApi = useFollowPathStoreApi()
    const waypointFlowStoreApi = useWaypointFlowStoreApi()
    const goalStoreApi = useGoalStoreApi()
    const addNotification = useNotifications((state) => state.addNotification)

    return useCallback(
      (blockedCell?: HexCell) => {
        followPathStoreApi.getState().end()
        waypointFlowStoreApi.getState().clear()

        /** 途中停止の原因が EN 不足か（ゴール到達による停止を除く） */
        const isBlockedByEnergy =
          blockedCell !== undefined && !goalStoreApi.getState().reached

        // 最終セルへ到着、またはゴール到達による停止: 警告しない
        if (!isBlockedByEnergy) {
          return
        }

        addNotification({
          options: { autoDismiss: true },
          title: `EN 不足のため (${blockedCell.q}, ${blockedCell.r}) の手前で停止しました`,
          type: 'warning',
        })
      },
      [addNotification, followPathStoreApi, goalStoreApi, waypointFlowStoreApi],
    )
  }
