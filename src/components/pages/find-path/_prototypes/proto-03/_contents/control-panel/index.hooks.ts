import { useCallback } from 'react'

import { useReset } from '../../_contexts/reset'
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

  /**
   * 中継点選択を確定し、経路提示中(`proposing`)へ戻す
   *
   * - 設置済みの `waypoints` はクリアしない（「実行」までプレビュー経路に使う）
   * - `idle` へ戻すと吹き出し（「実行」）が消え、経路プレビューだけ残るため不可
   */
  const handleWaypointDoneClick = useCallback(() => {
    waypointFlowStoreApi.getState().setFlowState('proposing')
  }, [waypointFlowStoreApi])

  return {
    displayMode,
    enableWalking,
    fogModeDefault: fogStoreApi.getState().mode,
    goalReached,
    handleReset: reset,
    handleWaypointDoneClick,
    isSelectingWaypoint,
    setDisplayMode,
    setEnableWalking,
    setFogMode,
    setShowVisited,
    waypointCount,
  }
}
