import { useCallback } from 'react'

import { useEnergyEventDispatcher } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { isSameCell } from '../../../../../_lib/is-same-cell'
import { useCarriedItemStoreApi } from '../../../../../_stores/carried-items'
import { useEnergySettingsStoreApi } from '../../../../../_stores/energy-settings'
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
 * - 移動先セルの EN 補給アイテムは携行する（上限に達していればその場に残す）
 * - 移動先セルの EN スポットは扱わない（停止中に吹き出しから使用する。issue #297）
 * - EN を消費量設定（`consumePerMove`）分消費する
 * - 消費量 0（EN 無限）なら消費しない
 * - ゴールセルなら到達を記録する
 */
export const useHandleCellChange = (): UseStageReturn['handleCellChange'] => {
  const markVisited = useFogStore((state) => state.markVisited)
  const reachGoal = useGoalStore((state) => state.reach)
  const carriedItemStoreApi = useCarriedItemStoreApi()
  const energyDispatch = useEnergyEventDispatcher()
  const energySettingsStoreApi = useEnergySettingsStoreApi()
  const itemStoreApi = useItemStoreApi()
  const waypointFlowStoreApi = useWaypointFlowStoreApi()

  return useCallback(
    (cell: HexCell) => {
      waypointFlowStoreApi.getState().clear()
      markVisited(cell)

      const item = itemStoreApi.getState().getItemAtCell(cell)

      /** EN 補給アイテム（`stock` 未指定）を携行できたか。上限に達していれば携行しない */
      const pickedUp =
        item !== undefined &&
        item.stock === undefined &&
        carriedItemStoreApi.getState().pickUp(item)

      // EN 補給アイテムを携行した: その場から取り除く（補給は使用時）
      if (pickedUp) {
        itemStoreApi.getState().consumeItem(item.id)
      }

      const { consumePerMove } = energySettingsStoreApi.getState()

      // 消費は energy store 側の consume-listener が実処理・閾値判定・Energy-depleted
      // 発行を担う（proto-01 の `use-find-path-tick` と同じ経路）。EN 切れ演出の発火は
      // `useOutOfEnergyEventListener` 側が担うため、ここでは dispatch するだけでよい
      if (consumePerMove > 0) {
        void energyDispatch['Energy-consume']({
          actorId: PLAYER_ACTOR_ID,
          amount: consumePerMove,
        })
      }

      if (isSameCell(cell, GOAL_POSITION)) {
        reachGoal()
      }
    },
    [
      carriedItemStoreApi,
      energyDispatch,
      energySettingsStoreApi,
      itemStoreApi,
      markVisited,
      reachGoal,
      waypointFlowStoreApi,
    ],
  )
}
