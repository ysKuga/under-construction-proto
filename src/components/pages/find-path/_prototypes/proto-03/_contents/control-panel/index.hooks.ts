import { useCallback } from 'react'

import { useReset } from '../../_contexts/reset'
import { useFindPathEventDispatcher } from '../../_events'
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
  const reset = useReset()
  const findPathEventDispatcher = useFindPathEventDispatcher()

  /**
   * 中継点選択を確定し、経路提示中(`proposing`)へ戻す
   *
   * - 設置済みの `waypoints` はクリアしない（「実行」までプレビュー経路に使う）
   * - `idle` へ戻すと吹き出し（「実行」）が消え、経路プレビューだけ残るため不可
   */
  const handleWaypointDoneClick = useCallback(() => {
    waypointFlowStoreApi.getState().setFlowState('proposing')
  }, [waypointFlowStoreApi])

  /**
   * 「チェックポイントへ」クリック時。チェックポイントへのリセットを要求する
   *
   * - 受理条件（EN 切れ中かつ停止中）の判定は listener が担う。拒否時は何もしない
   */
  const handleResetToCheckpoint = useCallback(() => {
    void findPathEventDispatcher['FindPath-reset-to-checkpoint'](undefined)
  }, [findPathEventDispatcher])

  return {
    displayMode,
    enableWalking,
    fogModeDefault: fogStoreApi.getState().mode,
    goalReached,
    handleReset: reset,
    handleResetToCheckpoint,
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
