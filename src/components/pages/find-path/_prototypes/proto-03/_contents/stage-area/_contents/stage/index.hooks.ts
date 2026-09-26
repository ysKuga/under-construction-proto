import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { usePlayerActorEventTarget } from '../../../../_contexts/player-actor-event-target'
import { useStage07HandleRef } from '../../../../_contexts/stage07-handle'
import { useAdvanceFollowPathOnCellReach } from '../../../../_hooks/use-advance-follow-path-on-cell-reach'
import { usePreviewPath } from '../../../../_hooks/use-preview-path'
import { useDisplaySettingsStore } from '../../../../_stores/display-settings'
import { useFollowPathStore } from '../../../../_stores/follow-path'
import { useWaypointFlowStore } from '../../../../_stores/waypoint-flow'

import { useCanEnterCell } from './_hooks/use-can-enter-cell'
import { useGetCellTitle } from './_hooks/use-get-cell-title'
import { useHandleCellChange } from './_hooks/use-handle-cell-change'
import { useHandleFollowPathEnd } from './_hooks/use-handle-follow-path-end'
import { useHandleNonAdjacentClick } from './_hooks/use-handle-non-adjacent-click'
import { useHandleWaypointCellClick } from './_hooks/use-handle-waypoint-cell-click'
import { useRegisterPlayerEnergyOut } from './_hooks/use-register-player-energy-out'
import { useVisibilityNodeRegistrars } from './_hooks/use-visibility-node-registrars'
import { UseStageReturn } from './index.types'

/** ステージ（`Stage07` + 各レイヤー）の表示値・操作をまとめる */
export const useStage = (): UseStageReturn => {
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  const displayMode = useDisplaySettingsStore((state) => state.displayMode)
  const enableWalking = useDisplaySettingsStore((state) => state.enableWalking)
  /** 中継点選択モード中か */
  const waypointSelecting = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )
  /** 非隣接クリックで選んだ経路の目標セル（経路プレビュー中のみ） */
  const objectiveCell = useWaypointFlowStore((state) => state.objectiveCell)
  const waypoints = useWaypointFlowStore((state) => state.waypoints)
  /**
   * 自動移動中の経路
   *
   * - 変化するのは自動移動の開始・終了時のみ。1 マスごとの進行（`followedCount`）は
   *   `PathPreviewLayer` が直接購読するため、ここでは購読しない
   */
  const followingPath = useFollowPathStore((state) => state.followingPath)
  /** 経路に沿った自動移動中か（`Stage07` を非対話化する） */
  const isAutoMoving = useFollowPathStore((state) => state.isFollowing())
  const stage07HandleRef = useStage07HandleRef()
  const previewPath = usePreviewPath()
  const actorEventTarget = usePlayerActorEventTarget()
  const { canEnterCell, canEnterCellPerceived } = useCanEnterCell()
  const getCellTitle = useGetCellTitle()
  const handleCellChange = useHandleCellChange()
  const handleFollowPathEnd = useHandleFollowPathEnd()
  const handleNonAdjacentClick = useHandleNonAdjacentClick()
  const handleWaypointCellClick = useHandleWaypointCellClick()
  const {
    registerFloorVisibilityNode,
    registerMarkerVisibilityNode,
    registerWaypointVisibilityNode,
  } = useVisibilityNodeRegistrars()

  useRegisterPlayerEnergyOut()

  // 経路プレビューの点は、bot がマスの中心に着いた時点で消す（進行の記録を到達時に行う）
  useAdvanceFollowPathOnCellReach(PLAYER_ACTOR_ID)

  return {
    actorEventTarget,
    canEnterCell,
    canEnterCellPerceived,
    currentCell,
    displayMode,
    enableWalking,
    getCellTitle,
    handleCellChange,
    handleFollowPathEnd,
    handleNonAdjacentClick,
    handleWaypointCellClick,
    interactive: !waypointSelecting && !isAutoMoving,
    objectiveMarkerCell: isAutoMoving ? followingPath.at(-1) : objectiveCell,
    previewPath,
    registerFloorVisibilityNode,
    registerMarkerVisibilityNode,
    registerWaypointVisibilityNode,
    stage07HandleRef,
    waypoints,
    waypointSelecting,
  }
}
