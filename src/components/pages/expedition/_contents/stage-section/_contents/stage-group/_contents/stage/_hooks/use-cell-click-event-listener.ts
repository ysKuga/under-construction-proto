import { useCallback } from 'react'
import { match } from 'ts-pattern'

import { useNotifications } from '@/components/ui/notifications'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { useStage07HandleRef } from '@/components/pages/expedition/_stage-components/hex-stage/_contexts/stage07-handle'
import { useStage07EventListener } from '@/components/pages/expedition/_stage-components/hex-stage/_events'
import { useActorsStoreApi } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'

import { useStageLayout } from '../../../../../../../_contexts/stage-layout'
import { useFindPathEventDispatcher } from '../../../../../../../_events'
import { canEnterForPath } from '../../../../../../../_lib/can-enter-for-path'
import { classifyCellClick } from '../../../../../../../_lib/classify-cell-click'
import { findHexPathViaWaypoints } from '../../../../../../../_lib/find-hex-path-via-waypoints'
import { useWaypointFlowStoreApi } from '../../../../../../../_stores/waypoint-flow'
import { GRID } from '../../../../../../../constants'

/**
 * セルのクリック（`Stage07-cell-click`）を、移動・目標設定へ振り分ける
 *
 * - クリックの分類はここに集約する。`Stage07` はクリックしたセルを発行するのみ
 * - 分類は `classifyCellClick` で行う（選択可能表示の判定と同じ元）
 * - 現在マスは何もしない
 * - 隣接マスは `Stage07Handle.moveTo` で移動を試みる。進入不可（障害物・EN 切れ等）で
 *   拒否された場合は、目標として扱う
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

        const { flowState, objectiveCell } = waypointFlowStoreApi.getState()
        const kind = classifyCellClick(cell, {
          currentCell,
          flowState,
          objectiveCell,
        })

        /** cell を目標として経路を提示する（拒否・到達不能時はそれぞれ知らせる） */
        const proposeObjective = async () => {
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
        }

        await match(kind)
          // 現在マス: 移動でも目標でもないため何もしない
          .with('current', () => {})
          .with('move', async () => {
            /** 移動できたか（進入不可なら拒否される） */
            const moved = stage07HandleRef.current?.moveTo(cell) ?? false

            // 移動を拒否された: 目標として扱う
            if (!moved) await proposeObjective()
          })
          // 目標セルの再クリック: 目標設定をキャンセルする
          .with('cancel-objective', () =>
            waypointFlowStoreApi.getState().clear(),
          )
          .with('objective', proposeObjective)
          .exhaustive()
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
