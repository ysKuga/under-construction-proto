import { useCallback } from 'react'

import { useGamePhaseStore } from '../../_stores/game-phase'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../_stores/waypoint-flow'

import { UseStatusPanelReturn } from './index.types'

/** 状態表示の値・操作を各 store から集める */
export const useStatusPanel = (): UseStatusPanelReturn => {
  const goalReached = useGamePhaseStore((state) => state.phase !== 'playing')
  const isSelectingWaypoint = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )
  const waypointCount = useWaypointFlowStore((state) => state.waypoints.length)
  const waypointFlowStoreApi = useWaypointFlowStoreApi()

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
    goalReached,
    handleWaypointDoneClick,
    isSelectingWaypoint,
    waypointCount,
  }
}
