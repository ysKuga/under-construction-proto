import { useCallback } from 'react'

import { useNotifications } from '@/components/ui/notifications'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useStage07HandleRef } from '@/prototypes/stage/stage-07/_contexts/stage07-handle'
import { useStage07EventListener } from '@/prototypes/stage/stage-07/_events'
import { isSameHexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { useActorsStoreApi } from '@/prototypes/stage/stage-07/_stores/actors'

import { useStageLayout } from '../../../../../_contexts/stage-layout'
import { useFindPathEventDispatcher } from '../../../../../_events'
import { canEnterForPath } from '../../../../../_lib/can-enter-for-path'
import { findHexPathViaWaypoints } from '../../../../../_lib/find-hex-path-via-waypoints'
import { useWaypointFlowStoreApi } from '../../../../../_stores/waypoint-flow'
import { GRID } from '../../../../../constants'

/**
 * セルのクリック（`Stage07-cell-click`）を、移動・目標設定へ振り分ける
 *
 * - クリックの分類はここに集約する。`Stage07` はクリックしたセルを発行するのみ
 * - 現在マスは何もしない
 * - 直接移動できるマス（隣接・進入可）は `Stage07Handle.moveTo` で移動する
 * - 直接移動できないマスは、そのマスを目標として BFS で経路を求め `PathPreviewLayer` へ表示する
 *   （自動移動は吹き出しの「実行」で開始する、issue #226）。到達不能なら通知する
 *   - 新しい目標は中継点なしで経路を求める（前の目標の中継点は引き継がない）
 *   - 提示前に `FindPath-propose-path` を発行し、listener に拒否されたら（EN 切れ等）
 *     bot 頭上の吹き出しを揺らすのみ（`FindPath-shake-bot-bubble`）。拒否の理由（EN 等）は
 *     ここでは扱わない（ui-jurisdiction）
 * - 経路提示中に目標セルを再クリックした場合は目標設定をキャンセルする（タッチ操作向け、
 *   ESC の代替）。キャンセルは提示ではないため `FindPath-propose-path` を発行しない
 */
export const useCellClickEventListener = (): void => {
  const actorsStoreApi = useActorsStoreApi()
  const stage07HandleRef = useStage07HandleRef()
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  const addNotification = useNotifications((state) => state.addNotification)
  const findPathEventDispatcher = useFindPathEventDispatcher()
  const stageLayout = useStageLayout()

  useStage07EventListener(
    'Stage07-cell-click',
    useCallback(
      async (event) => {
        const { cell } = event.detail
        const currentCell = actorsStoreApi.getState().actors[PLAYER_ACTOR_ID]

        // 現在マス: 移動でも目標でもないため何もしない
        if (isSameHexCell(currentCell, cell)) return

        /** 直接移動できたか（隣接・進入可） */
        const moved = stage07HandleRef.current?.moveTo(cell) ?? false

        // 直接移動できた: 終了
        if (moved) return

        const { flowState, objectiveCell } = waypointFlowStoreApi.getState()
        /** 経路提示中の目標セルを再クリックしたか */
        const isObjectiveReclick =
          flowState === 'proposing' &&
          objectiveCell !== undefined &&
          isSameHexCell(objectiveCell, cell)

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
          (from, to) => canEnterForPath(from, to, stageLayout),
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
        actorsStoreApi,
        addNotification,
        findPathEventDispatcher,
        stage07HandleRef,
        stageLayout,
        waypointFlowStoreApi,
      ],
    ),
  )
}
