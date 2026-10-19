'use client'

import { HexStage } from '@/components/pages/expedition/_stage-components/hex-stage'

import { GoalMarkerLayer } from '../../../../_layers/goal-marker-layer'
import { ItemLayer } from '../../../../_layers/item-layer'
import { MoveTargetLayer } from '../../../../_layers/move-target-layer'
import { ObjectiveMarkerLayer } from '../../../../_layers/objective-marker-layer'
import { ObstacleLayer } from '../../../../_layers/obstacle-layer'
import { OneWayLayer } from '../../../../_layers/one-way-layer'
import { PathPreviewLayer } from '../../../../_layers/path-preview-layer'
import { WaypointSelectLayer } from '../../../../_layers/waypoint-select-layer'
import {
  BOT_SIZE,
  GRID,
  HEX_SIZE,
  INITIAL_TILT_DEG,
} from '../../../../constants'

import { StageSettings } from './_components/stage-settings'
import { useStage } from './index.hooks'

/**
 * ステージ（`HexStage` + expedition 固有のレイヤー群）
 *
 * - 隣接クリック移動は `HexStage` の `useHexMove` に内蔵済み（issue #162）。ここでは
 *   移動成立時の処理（EN 消費・アイテムによる補給・ゴール到達判定）を `onCellChange` で受ける
 * - セルのクリック（`HexStage-cell-click`）は `useCellClickEventListener` が移動・目標設定へ振り分ける。
 *   直接移動できないセルのクリックで経路を求め `PathPreviewLayer` へ表示する（issue #137/#226）
 * - 中継点選択モード中は `HexStage` を非対話化し、`WaypointSelectLayer` がセルクリックを
 *   拾って中継点を設置/除去する（通常モードのクリックとは完全に別イベント）
 * - 各レイヤーの DOM は visibility registry へ登録し、未到達マスを非表示にする
 * - 床の左下（`belowFloor`）へ設定アイコン（調整スライダーのポップオーバー）を重ねる
 */
export const Stage = () => {
  const {
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
    interactive,
    legSwingAngle,
    maxWalkCycleSec,
    moveDurationMs,
    objectiveMarkerCell,
    previewPath,
    registerFloorVisibilityNode,
    registerMarkerVisibilityNode,
    registerWaypointVisibilityNode,
    hexStageHandleRef,
    waypoints,
    waypointSelecting,
  } = useStage()

  return (
    // 床(scene)の幅へ合わせる
    <div className="w-min">
      <HexStage
        actorEventTarget={actorEventTarget}
        belowFloor={
          // 設定アイコンを床の左下へ重ねる
          <div className="relative">
            <div className="absolute bottom-full left-0 z-10">
              <StageSettings />
            </div>
          </div>
        }
        bodyBobHeight={bodyBobHeight}
        botSize={BOT_SIZE}
        canEnterCell={canEnterCell}
        cols={GRID.cols}
        enableWalking={enableWalking}
        hexSize={HEX_SIZE}
        initialTiltDeg={INITIAL_TILT_DEG}
        interactive={interactive}
        legSwingAngle={legSwingAngle}
        maxWalkCycleSec={maxWalkCycleSec}
        moveDurationMs={moveDurationMs}
        onCellChange={handleCellChange}
        onFollowPathEnd={handleFollowPathEnd}
        ref={hexStageHandleRef}
        registerCellVisibilityNode={registerFloorVisibilityNode}
        rows={GRID.rows}
      >
        <GoalMarkerLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          registerVisibilityNode={registerMarkerVisibilityNode}
          rows={GRID.rows}
        />
        <ObstacleLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          registerVisibilityNode={registerMarkerVisibilityNode}
          rows={GRID.rows}
        />
        <OneWayLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          registerVisibilityNode={registerMarkerVisibilityNode}
          rows={GRID.rows}
        />
        <ItemLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          registerVisibilityNode={registerMarkerVisibilityNode}
          rows={GRID.rows}
        />
        <MoveTargetLayer
          canEnterCell={canEnterCellPerceived}
          cols={GRID.cols}
          currentCell={currentCell}
          hexSize={HEX_SIZE}
          mode={displayMode}
          rows={GRID.rows}
        />
        <PathPreviewLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          path={previewPath}
          rows={GRID.rows}
        />
        <ObjectiveMarkerLayer
          anchorSize={BOT_SIZE}
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          objectiveCell={objectiveMarkerCell}
          rows={GRID.rows}
        />
        <WaypointSelectLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          onCellClick={handleWaypointCellClick}
          registerVisibilityNode={registerWaypointVisibilityNode}
          rows={GRID.rows}
          visible={waypointSelecting}
          waypoints={waypoints}
        />
      </HexStage>
    </div>
  )
}
