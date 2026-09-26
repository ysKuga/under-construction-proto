import { useCallback } from 'react'

import { useEnergyStore } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useReset } from '../../_contexts/reset'
import { useDisplaySettingsStore } from '../../_stores/display-settings'
import { useFogStore, useFogStoreApi } from '../../_stores/fog'
import { useGoalStore } from '../../_stores/goal'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../_stores/waypoint-flow'

import { UseControlPanelReturn } from './index.types'

/**
 * 操作パネルの表示値・操作を各 store から集める
 *
 * - EN 残量はここでのみ購読する。EN 変化で再レンダリングされるのは操作パネルのみ
 */
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
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )
  const goalReached = useGoalStore((state) => state.reached)
  const isSelectingWaypoint = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )
  const waypointCount = useWaypointFlowStore((state) => state.waypoints.length)
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  const reset = useReset()

  /** 設置済みの `waypoints` はクリアしない（「実行」までプレビュー経路に使う） */
  const handleWaypointDoneClick = useCallback(() => {
    waypointFlowStoreApi.getState().setFlowState('idle')
  }, [waypointFlowStoreApi])

  return {
    displayMode,
    enableWalking,
    energyInfo,
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
