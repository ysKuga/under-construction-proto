import { useCallback } from 'react'

import { useNotifications } from '@/components/ui/notifications'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { useFindPathEventDispatcher } from '../../../_events'
import { canEnterForPath } from '../../../_lib/can-enter-for-path'
import { findHexPathViaWaypoints } from '../../../_lib/find-hex-path-via-waypoints'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../../_stores/waypoint-flow'
import { GRID } from '../../../constants'
import { UseStageReturn } from '../index.types'

/**
 * 非隣接セルクリック時の処理を返す
 *
 * - クリックしたセルを目標とし、BFS で経路を求め `PathPreviewLayer` へ表示する
 *   （自動移動は吹き出しの「実行」で開始する、issue #226）。到達不能なら通知する
 * - `Stage07` は find-path 固有の概念（目標）を持たないため、prop 名は
 *   `onNonAdjacentClick`（クリックの種類）のまま受ける
 * - 提示前に `FindPath-propose-path` を発行し、listener に拒否されたら（EN 切れ等）
 *   何もしない。拒否の理由（EN 等）は UI では扱わない（ui-jurisdiction）
 */
export const useHandleNonAdjacentClick =
  (): UseStageReturn['handleNonAdjacentClick'] => {
    const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
    const waypoints = useWaypointFlowStore((state) => state.waypoints)
    const waypointFlowStoreApi = useWaypointFlowStoreApi()
    const addNotification = useNotifications((state) => state.addNotification)
    const findPathEventDispatcher = useFindPathEventDispatcher()

    return useCallback(
      async (cell: HexCell) => {
        if (
          !(await findPathEventDispatcher['FindPath-propose-path']({ cell }))
        ) {
          return
        }

        const path = findHexPathViaWaypoints(
          currentCell,
          waypoints,
          cell,
          GRID.cols,
          GRID.rows,
          canEnterForPath,
        )

        if (!path) {
          addNotification({
            options: { autoDismiss: true },
            title: `(${cell.q}, ${cell.r}) へは到達できません`,
            type: 'info',
          })
          waypointFlowStoreApi.getState().unpropose()

          return
        }

        waypointFlowStoreApi.getState().propose(cell)
      },
      [
        addNotification,
        currentCell,
        findPathEventDispatcher,
        waypointFlowStoreApi,
        waypoints,
      ],
    )
  }
