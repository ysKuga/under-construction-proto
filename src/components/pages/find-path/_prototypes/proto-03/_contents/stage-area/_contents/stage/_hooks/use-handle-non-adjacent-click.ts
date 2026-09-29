import { useCallback } from 'react'

import { useNotifications } from '@/components/ui/notifications'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { useFindPathEventDispatcher } from '../../../../../_events'
import { canEnterForPath } from '../../../../../_lib/can-enter-for-path'
import { findHexPathViaWaypoints } from '../../../../../_lib/find-hex-path-via-waypoints'
import { useWaypointFlowStoreApi } from '../../../../../_stores/waypoint-flow'
import { GRID } from '../../../../../constants'
import { UseStageReturn } from '../index.types'

/**
 * 非隣接セルクリック時の処理を返す
 *
 * - クリックしたセルを目標とし、BFS で経路を求め `PathPreviewLayer` へ表示する
 *   （自動移動は吹き出しの「実行」で開始する、issue #226）。到達不能なら通知する
 * - 新しい目標は中継点なしで経路を求める（前の目標の中継点は引き継がない）
 * - `Stage07` は find-path 固有の概念（目標）を持たないため、prop 名は
 *   `onNonAdjacentClick`（クリックの種類）のまま受ける
 * - 提示前に `FindPath-propose-path` を発行し、listener に拒否されたら（EN 切れ等）
 *   bot 頭上の吹き出しを揺らすのみ（`FindPath-shake-bot-bubble`）。拒否の理由（EN 等）は
 *   UI では扱わない（ui-jurisdiction）
 * - 経路提示中に目標セルを再クリックした場合は目標設定をキャンセルする（タッチ操作向け、
 *   ESC の代替）。キャンセルは提示ではないため `FindPath-propose-path` を発行しない
 */
export const useHandleNonAdjacentClick =
  (): UseStageReturn['handleNonAdjacentClick'] => {
    const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
    const waypointFlowStoreApi = useWaypointFlowStoreApi()
    const addNotification = useNotifications((state) => state.addNotification)
    const findPathEventDispatcher = useFindPathEventDispatcher()

    return useCallback(
      async (cell: HexCell) => {
        const { flowState, objectiveCell } = waypointFlowStoreApi.getState()
        /** 経路提示中の目標セルを再クリックしたか */
        const isObjectiveReclick =
          flowState === 'proposing' &&
          objectiveCell?.q === cell.q &&
          objectiveCell.r === cell.r

        // 目標セルの再クリック: 目標設定をキャンセルする
        if (isObjectiveReclick) {
          waypointFlowStoreApi.getState().clear()

          return
        }

        /** listener が経路の提示を許可したか（EN 切れ等で拒否される） */
        const proposeAllowed = await findPathEventDispatcher[
          'FindPath-propose-path'
        ]({ cell })

        // 提示を拒否された: bot 頭上の吹き出しを揺らして知らせる
        if (!proposeAllowed) {
          void findPathEventDispatcher['FindPath-shake-bot-bubble'](undefined)

          return
        }

        const path = findHexPathViaWaypoints(
          currentCell,
          [],
          cell,
          GRID.cols,
          GRID.rows,
          canEnterForPath,
        )

        // 到達不能: 通知し、前の目標も消す
        if (!path) {
          addNotification({
            options: { autoDismiss: true },
            title: `(${cell.q}, ${cell.r}) へは到達できません`,
            type: 'info',
          })
          waypointFlowStoreApi.getState().clear()

          return
        }

        // 到達可能: cell を目標として経路を提示する
        waypointFlowStoreApi.getState().propose(cell)
      },
      [
        addNotification,
        currentCell,
        findPathEventDispatcher,
        waypointFlowStoreApi,
      ],
    )
  }
