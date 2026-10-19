import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { useHexStageHandleRef } from '@/components/pages/expedition/_stage-components/hex-stage/_contexts/hex-stage-handle'
import { useActorsStore } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'

import { usePlayerActorEventTarget } from '../../../../_contexts/player-actor-event-target'
import { useAdvanceFollowPathOnCellReach } from '../../../../_hooks/use-advance-follow-path-on-cell-reach'
import { usePreviewPath } from '../../../../_hooks/use-preview-path'
import { useDisplaySettingsStore } from '../../../../_stores/display-settings'
import { useFollowPathStore } from '../../../../_stores/follow-path'
import { useGamePhaseStore } from '../../../../_stores/game-phase'
import { usePlayerActivityStore } from '../../../../_stores/player-activity'
import { useWaypointFlowStore } from '../../../../_stores/waypoint-flow'

import { useArriveAtGoalOnCellReach } from './_hooks/use-arrive-at-goal-on-cell-reach'
import { useCanEnterCell } from './_hooks/use-can-enter-cell'
import { useCancelWaypointFlowOnEscape } from './_hooks/use-cancel-waypoint-flow-on-escape'
import { useCellClickEventListener } from './_hooks/use-cell-click-event-listener'
import { useClearWaypointFlowOnEnergyDepleted } from './_hooks/use-clear-waypoint-flow-on-energy-depleted'
import { useEnergySpotUseEventListener } from './_hooks/use-energy-spot-use-event-listener'
import { useHandleCellChange } from './_hooks/use-handle-cell-change'
import { useHandleFollowPathEnd } from './_hooks/use-handle-follow-path-end'
import { useHandleWaypointCellClick } from './_hooks/use-handle-waypoint-cell-click'
import { useRecordHistoryOnEnergyDepleted } from './_hooks/use-record-history-on-energy-depleted'
import { useRegisterPlayerEnergyOut } from './_hooks/use-register-player-energy-out'
import { useResetToCheckpointEventListener } from './_hooks/use-reset-to-checkpoint-event-listener'
import { useSetPlayerActivityOnMove } from './_hooks/use-set-player-activity-on-move'
import { useVisibilityNodeRegistrars } from './_hooks/use-visibility-node-registrars'
import { UseStageReturn } from './index.types'

/** ステージ（`HexStage` + 各レイヤー）の表示値・操作をまとめる */
export const useStage = (): UseStageReturn => {
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  const displayMode = useDisplaySettingsStore((state) => state.displayMode)
  const enableWalking = useDisplaySettingsStore((state) => state.enableWalking)
  /** セル間移動アニメーションの所要時間(ms) */
  const moveDurationMs = useDisplaySettingsStore(
    (state) => state.moveDurationMs,
  )
  /** walking の脚振り周期の上限(秒) */
  const maxWalkCycleSec = useDisplaySettingsStore(
    (state) => state.maxWalkCycleSec,
  )
  /** walking の脚振り角の振幅(rad) */
  const legSwingAngle = useDisplaySettingsStore((state) => state.legSwingAngle)
  /** 歩行中の体の上下の最大持ち上げ量(world) */
  const bodyBobHeight = useDisplaySettingsStore((state) => state.bodyBobHeight)
  /** 中継点選択モード中か */
  const waypointSelecting = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )
  /** 直接移動できないセルのクリックで選んだ経路の目標セル（経路プレビュー中のみ） */
  const objectiveCell = useWaypointFlowStore((state) => state.objectiveCell)
  const waypoints = useWaypointFlowStore((state) => state.waypoints)
  /**
   * 自動移動中の経路
   *
   * - 変化するのは自動移動の開始・終了時のみ。1 マスごとの進行（`followedCount`）は
   *   `PathPreviewLayer` が直接購読するため、ここでは購読しない
   */
  const followingPath = useFollowPathStore((state) => state.followingPath)
  /** 経路に沿った自動移動中か（`HexStage` を非対話化する） */
  const isAutoMoving = useFollowPathStore((state) => state.isFollowing())
  /** EN スポットで補給中か（`HexStage` を非対話化する） */
  const isCharging = usePlayerActivityStore(
    (state) => state.activity === 'charging',
  )
  /** ステージの操作を許可するフェーズか（ゴール後の終了状態では非対話化する） */
  const operateStageAllowed = useGamePhaseStore((state) =>
    state.allows('operateStage'),
  )
  const hexStageHandleRef = useHexStageHandleRef()
  const previewPath = usePreviewPath()
  const actorEventTarget = usePlayerActorEventTarget()
  const { canEnterCell, canEnterCellPerceived } = useCanEnterCell()
  const handleCellChange = useHandleCellChange()
  const handleFollowPathEnd = useHandleFollowPathEnd()
  const handleWaypointCellClick = useHandleWaypointCellClick()
  const {
    registerFloorVisibilityNode,
    registerMarkerVisibilityNode,
    registerWaypointVisibilityNode,
  } = useVisibilityNodeRegistrars()

  useRegisterPlayerEnergyOut()
  useCellClickEventListener()
  useCancelWaypointFlowOnEscape()
  useClearWaypointFlowOnEnergyDepleted()
  useRecordHistoryOnEnergyDepleted()
  useResetToCheckpointEventListener()
  useSetPlayerActivityOnMove()
  useEnergySpotUseEventListener()

  // 経路プレビューの点は、bot がマスの中心に着いた時点で消す（進行の記録を到達時に行う）
  useAdvanceFollowPathOnCellReach(PLAYER_ACTOR_ID)
  useArriveAtGoalOnCellReach(PLAYER_ACTOR_ID)

  return {
    actorEventTarget,
    bodyBobHeight,
    canEnterCell,
    canEnterCellPerceived,
    currentCell,
    displayMode,
    enableWalking,
    handleCellChange,
    handleFollowPathEnd,
    handleWaypointCellClick,
    interactive:
      operateStageAllowed && !waypointSelecting && !isAutoMoving && !isCharging,
    legSwingAngle,
    maxWalkCycleSec,
    moveDurationMs,
    objectiveMarkerCell: isAutoMoving ? followingPath.at(-1) : objectiveCell,
    previewPath,
    registerFloorVisibilityNode,
    registerMarkerVisibilityNode,
    registerWaypointVisibilityNode,
    hexStageHandleRef,
    waypoints,
    waypointSelecting,
  }
}
