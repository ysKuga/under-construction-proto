import { useCallback } from 'react'

import { useNotifications } from '@/components/ui/notifications'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { canEnterForPath } from '../../../_lib/can-enter-for-path'
import { findHexPathViaWaypoints } from '../../../_lib/find-hex-path-via-waypoints'
import { isSameCell } from '../../../_lib/is-same-cell'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../../_stores/waypoint-flow'
import { GRID } from '../../../constants'
import { UseStageReturn } from '../index.types'

/**
 * 中継点選択モード中のセルクリック時の処理を返す。中継点を設置/除去する
 *
 * - 経由順は設置順でなく最近傍順（`findHexPathViaWaypoints` 内で決める）
 * - 設置により経路が到達不能になる場合（障害物セル等）は通知して設置しない
 */
export const useHandleWaypointCellClick =
  (): UseStageReturn['handleWaypointCellClick'] => {
    const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
    const objectiveCell = useWaypointFlowStore((state) => state.objectiveCell)
    const waypoints = useWaypointFlowStore((state) => state.waypoints)
    const waypointFlowStoreApi = useWaypointFlowStoreApi()
    const addNotification = useNotifications((state) => state.addNotification)

    return useCallback(
      (cell: HexCell) => {
        const index = waypoints.findIndex((waypoint) =>
          isSameCell(waypoint, cell),
        )

        if (index !== -1) {
          waypointFlowStoreApi
            .getState()
            .setWaypoints(waypoints.filter((_, i) => i !== index))

          return
        }

        const next = [...waypoints, cell]
        const path =
          objectiveCell &&
          findHexPathViaWaypoints(
            currentCell,
            next,
            objectiveCell,
            GRID.cols,
            GRID.rows,
            canEnterForPath,
          )

        if (!path) {
          addNotification({
            options: { autoDismiss: true },
            title: `(${cell.q}, ${cell.r}) を経由できません`,
            type: 'info',
          })

          return
        }

        waypointFlowStoreApi.getState().setWaypoints(next)
      },
      [
        addNotification,
        currentCell,
        objectiveCell,
        waypointFlowStoreApi,
        waypoints,
      ],
    )
  }
