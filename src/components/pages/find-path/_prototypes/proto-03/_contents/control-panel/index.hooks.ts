import { useCallback } from 'react'

import { useReset } from '../../_contexts/reset'
import { useFindPathEventDispatcher } from '../../_events'
import { useCarriedItemStore } from '../../_stores/carried-items'
import { useDisplaySettingsStore } from '../../_stores/display-settings'
import { useFogStore, useFogStoreApi } from '../../_stores/fog'
import { useGoalStore } from '../../_stores/goal'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../_stores/waypoint-flow'

import { UseControlPanelReturn } from './index.types'

/** 操作パネルの表示値・操作を各 store から集める */
export const useControlPanel = (): UseControlPanelReturn => {
  const displayMode = useDisplaySettingsStore((state) => state.displayMode)
  const setDisplayMode = useDisplaySettingsStore(
    (state) => state.setDisplayMode,
  )
  const enableWalking = useDisplaySettingsStore((state) => state.enableWalking)
  const setEnableWalking = useDisplaySettingsStore(
    (state) => state.setEnableWalking,
  )
  const syncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.syncStandaloneBotFacing,
  )
  const setSyncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.setSyncStandaloneBotFacing,
  )
  const setShowVisited = useFogStore((state) => state.setShowVisited)
  const setFogMode = useFogStore((state) => state.setMode)
  const fogStoreApi = useFogStoreApi()
  const goalReached = useGoalStore((state) => state.reached)
  const isSelectingWaypoint = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )
  const waypointCount = useWaypointFlowStore((state) => state.waypoints.length)
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  const carriedCount = useCarriedItemStore((state) => state.carriedItems.length)
  const carriedCapacity = useCarriedItemStore((state) => state.capacity)
  const findPathEventDispatcher = useFindPathEventDispatcher()
  const reset = useReset()

  /**
   * 中継点選択を確定し、経路提示中(`proposing`)へ戻す
   *
   * - 設置済みの `waypoints` はクリアしない（「実行」までプレビュー経路に使う）
   * - `idle` へ戻すと吹き出し（「実行」）が消え、経路プレビューだけ残るため不可
   */
  const handleWaypointDoneClick = useCallback(() => {
    waypointFlowStoreApi.getState().setFlowState('proposing')
  }, [waypointFlowStoreApi])

  /** 携行中の回復アイテムを1つ使用する（実処理は listener 側） */
  const handleUseCarriedItemClick = useCallback(() => {
    void findPathEventDispatcher['FindPath-use-carried-item'](undefined)
  }, [findPathEventDispatcher])

  return {
    carriedCapacity,
    carriedCount,
    displayMode,
    enableWalking,
    fogModeDefault: fogStoreApi.getState().mode,
    goalReached,
    handleReset: reset,
    handleUseCarriedItemClick,
    handleWaypointDoneClick,
    isSelectingWaypoint,
    setDisplayMode,
    setEnableWalking,
    setFogMode,
    setShowVisited,
    setSyncStandaloneBotFacing,
    syncStandaloneBotFacing,
    waypointCount,
  }
}
