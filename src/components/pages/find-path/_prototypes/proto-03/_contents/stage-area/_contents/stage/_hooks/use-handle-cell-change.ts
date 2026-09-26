import { useCallback } from 'react'

import { useEnergyEventDispatcher } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { isSameCell } from '../../../../../_lib/is-same-cell'
import { useFogStore } from '../../../../../_stores/fog'
import { useGoalStore } from '../../../../../_stores/goal'
import { useItemStoreApi } from '../../../../../_stores/items'
import { useWaypointFlowStoreApi } from '../../../../../_stores/waypoint-flow'
import { GOAL_POSITION } from '../../../../../constants'
import { UseStageReturn } from '../index.types'

/**
 * 現在地セル変更時（移動成立時）の処理を返す
 *
 * - 目標・中継点をクリアし、視界を到達済みとして記録する
 * - 移動先セルのアイテムを消費し即時回復、EN を 1 消費する
 * - ゴールセルなら到達を記録する
 */
export const useHandleCellChange = (): UseStageReturn['handleCellChange'] => {
  const markVisited = useFogStore((state) => state.markVisited)
  const reachGoal = useGoalStore((state) => state.reach)
  const energyDispatch = useEnergyEventDispatcher()
  const itemStoreApi = useItemStoreApi()
  const waypointFlowStoreApi = useWaypointFlowStoreApi()

  return useCallback(
    (cell: HexCell) => {
      waypointFlowStoreApi.getState().clear()
      markVisited(cell)

      const item = itemStoreApi.getState().getItemAtCell(cell)
      const consumed = item && itemStoreApi.getState().consumeItem(item.id)

      // 消費・回復とも energy store 側の consume/recover-listener が実処理・閾値判定・
      // Energy-depleted/Energy-recovered 発行を担う（proto-01 の `use-find-path-tick`
      // と同じ経路）。EN 切れ演出の発火・復帰は `useOutOfEnergyEventListener` 側が
      // 担うため、ここでは dispatch するだけでよい
      if (consumed) {
        void energyDispatch['Energy-recover']({
          actorId: PLAYER_ACTOR_ID,
          amount: consumed.amount,
        })
      }

      void energyDispatch['Energy-consume']({
        actorId: PLAYER_ACTOR_ID,
        amount: 1,
      })

      if (isSameCell(cell, GOAL_POSITION)) {
        reachGoal()
      }
    },
    [
      energyDispatch,
      itemStoreApi,
      markVisited,
      reachGoal,
      waypointFlowStoreApi,
    ],
  )
}
