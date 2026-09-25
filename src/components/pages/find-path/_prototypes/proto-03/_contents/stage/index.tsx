'use client'

import { Stage07 } from '@/prototypes/stage/stage-07'
import { CellTitleProvider } from '@/prototypes/stage/stage-07/_contexts/cell-title'

import { GoalMarkerLayer } from '../../_layers/goal-marker-layer'
import { ItemLayer } from '../../_layers/item-layer'
import { MoveTargetLayer } from '../../_layers/move-target-layer'
import { ObjectiveMarkerLayer } from '../../_layers/objective-marker-layer'
import { ObstacleLayer } from '../../_layers/obstacle-layer'
import { OneWayLayer } from '../../_layers/one-way-layer'
import { PathPreviewLayer } from '../../_layers/path-preview-layer'
import { WaypointSelectLayer } from '../../_layers/waypoint-select-layer'
import { GRID, HEX_SIZE } from '../../constants'

import { useStage } from './index.hooks'

/** bot(box-bot-01)の一辺 px */
const BOT_SIZE = 56

/**
 * ステージ（`Stage07` + find-path 固有のレイヤー群）
 *
 * - 隣接クリック移動は `Stage07` の `useHexMove` に内蔵済み（issue #162）。ここでは
 *   移動成立時の処理（EN 消費・アイテム回復・ゴール到達判定）を `onCellChange` で受ける
 * - 非隣接セルクリックで経路を求め `PathPreviewLayer` へ表示する（issue #137/#226）
 * - 中継点選択モード中は `Stage07` を非対話化し、`WaypointSelectLayer` がセルクリックを
 *   拾って中継点を設置/除去する（通常モードのクリックとは完全に別イベント）
 * - 各レイヤーの DOM は visibility registry へ登録し、未到達マスを非表示にする
 */
export const Stage = () => {
  const {
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
    interactive,
    objectiveMarkerCell,
    previewPath,
    registerFloorVisibilityNode,
    registerMarkerVisibilityNode,
    registerWaypointVisibilityNode,
    stage07HandleRef,
    waypoints,
    waypointSelecting,
  } = useStage()

  return (
    // Stage07 は操作 slider 群が横に広がるため、min-content で床(scene)の幅へ合わせる
    <div className="w-min">
      <CellTitleProvider getCellTitle={getCellTitle}>
        <Stage07
          actorEventTarget={actorEventTarget}
          botSize={BOT_SIZE}
          canEnterCell={canEnterCell}
          cols={GRID.cols}
          enableWalking={enableWalking}
          hexSize={HEX_SIZE}
          initialTiltDeg={55}
          interactive={interactive}
          onCellChange={handleCellChange}
          onFollowPathEnd={handleFollowPathEnd}
          onNonAdjacentClick={handleNonAdjacentClick}
          ref={stage07HandleRef}
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
        </Stage07>
      </CellTitleProvider>
    </div>
  )
}
