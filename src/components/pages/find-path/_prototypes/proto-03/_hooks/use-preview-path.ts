import { useMemo } from 'react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { canEnterForPath } from '../_lib/can-enter-for-path'
import { findHexPathViaWaypoints } from '../_lib/find-hex-path-via-waypoints'
import { useWaypointFlowStore } from '../_stores/waypoint-flow'
import { GRID } from '../constants'

/**
 * 提示中の経路（中継点を最近傍順に経由し `objectiveCell` へ至る）
 *
 * - `PathPreviewLayer` の表示と「実行」の双方が同じ経路を使う
 * - 到達不能になる `objectiveCell`/`waypoints` は設定時点で弾くため、ここでの
 *   `undefined` は想定外（空配列へ倒す）
 */
export const usePreviewPath = (): HexCell[] => {
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  const objectiveCell = useWaypointFlowStore((state) => state.objectiveCell)
  const waypoints = useWaypointFlowStore((state) => state.waypoints)

  return useMemo(
    () =>
      (objectiveCell &&
        findHexPathViaWaypoints(
          currentCell,
          waypoints,
          objectiveCell,
          GRID.cols,
          GRID.rows,
          canEnterForPath,
        )) ??
      [],
    [currentCell, objectiveCell, waypoints],
  )
}
