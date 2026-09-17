'use client'

import { useState } from 'react'

import { Stage07 } from '@/prototypes/stage/stage-07'
import { ActorNodeRegistryProvider } from '@/prototypes/stage/stage-07/_contexts/actor-node-registry'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { ActionBar } from './_components/action-bar'
import { GoalMarkerLayer } from './_components/goal-marker-layer'
import {
  MoveTargetDisplayMode,
  MoveTargetLayer,
} from './_components/move-target-layer'
import { ObstacleLayer } from './_components/obstacle-layer'
import { OneWayLayer } from './_components/one-way-layer'
import { PlannedPathLayer } from './_components/planned-path-layer'
import { FindPathStoresProvider } from './_contexts/find-path-stores'
import {
  useVisibilityRegistry,
  VisibilityRegistryProvider,
} from './_contexts/visibility-registry'
import { useFindPathTick } from './_hooks/use-find-path-tick'
import { isObstacleCell } from './_lib/obstacle'
import { isBlockedByOneWay } from './_lib/one-way'
import { GOAL_POSITION, START_POSITION } from './constants'

/** グリッド形状 */
const GRID = { cols: 5, rows: 5 } as const
/** 六角形の外接円半径 (px) */
const HEX_SIZE = 40

/** axial セルの一致判定 */
const isSameCell = (a: HexCell, b: HexCell) => a.q === b.q && a.r === b.r

/** 移動方式（比較試作、切替可能） */
type MoveMode = 'instant' | 'planned'

/**
 * FindPathProto03 — find-path ページ試作（hex グリッド版）
 *
 * - proto-02（矩形グリッド・隣接クリック逐次移動）を hex グリッドへ移し替えた
 *   試作。移動方式自体は `Stage07` の `useHexMove` に内蔵済み（issue #162）のため、
 *   ここでは `Stage07` のマウントとゴール到達判定のみを担う
 * - `VisibilityRegistryProvider` は未到達マスを非表示にするための Provider（proto-02
 *   の hex 版）。可視判定は「視界（現在地基準の6近傍）」または「到達済み表示ONかつ
 *   到達済みセル」（`setShowVisited` で切替可能、既定 ON）。`Stage07`（hex タイルの
 *   表示/非表示）・`GoalMarkerLayer`（旗の表示/非表示）から読めるよう `Stage07`
 *   の外側に置く
 * - 確認ダイアログは対象外（別途検討）
 * - 歩行モーション（`Stage07` の `enableWalking`）はチェックボックスで切替可能（既定 ON）。
 *   `planned` モード（tick駆動実行）では bot dispatcher を `Stage07` の外へ出していない
 *   ため対象外（位置移動のみ、CSS transition で滑らかに動く）
 * - `ActorNodeRegistryProvider`（hex 版）は actor の現在セルを保持する Provider。
 *   `Stage07` の外側に置く（issue #181 PR-A。tick 駆動実行の追加に備え、外部から
 *   クリックを介さず actor を動かせるようにするため）
 * - `FindPathStoresProvider`（issue #181 PR-C）で game-clock / path / planned-path /
 *   energy を配線する。EN 消費・UI 表示は `planned` モードのみ対象
 *   （`instant` モードは比較試作用途のためEN検証対象外）
 * - 移動方式は `moveMode` で切替（既定 `instant`、従来動作を維持）
 *   - `instant`: 隣接クリックで即時1マス移動（`useHexMove` 内蔵、従来通り）
 *   - `planned`: `PlannedPathLayer`（隣接セルのみ選択可）へ予定経路を積み、
 *     `ActionBar`「実行」で tick 進行（`useFindPathTick`）。1 tick 消化ごとに
 *     EN を 1 消費し、0 で打ち切る
 */
const FindPathProto03 = () => {
  return (
    <FindPathStoresProvider>
      <ActorNodeRegistryProvider initialCell={START_POSITION}>
        <VisibilityRegistryProvider>
          <FindPathProto03Content />
        </VisibilityRegistryProvider>
      </ActorNodeRegistryProvider>
    </FindPathStoresProvider>
  )
}

/** `useVisibilityRegistry`/`useFindPathTick` を Provider の内側で呼び、UI へ配布する */
const FindPathProto03Content = () => {
  const [currentCell, setCurrentCell] = useState<HexCell>(START_POSITION)
  const [displayMode, setDisplayMode] =
    useState<MoveTargetDisplayMode>('scatter')
  const [enableWalking, setEnableWalking] = useState(true)
  const [goalReached, setGoalReached] = useState(false)
  const [moveMode, setMoveMode] = useState<MoveMode>('instant')
  const { markVisited, registerVisibilityNode, setShowVisited } =
    useVisibilityRegistry()

  const handleCellChange = (cell: HexCell) => {
    setCurrentCell(cell)
    markVisited(cell)

    if (isSameCell(cell, GOAL_POSITION)) {
      setGoalReached(true)
    }
  }

  /** 対象セルへ進入可能か（障害物・一方通行の逆走を除外） */
  const canEnterCell = (cell: HexCell) =>
    !isObstacleCell(cell) && !isBlockedByOneWay(currentCell, cell)

  const isPlanned = moveMode === 'planned'

  const { execute, isRunning, reachedGoal } = useFindPathTick({
    onCellChange: isPlanned ? handleCellChange : undefined,
  })

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Find Path (proto-03 / hex)
      </h1>
      <Stage07
        botSize={56}
        canEnterCell={canEnterCell}
        cols={GRID.cols}
        enableWalking={enableWalking}
        hexSize={HEX_SIZE}
        initialTiltDeg={55}
        interactive={!isPlanned}
        onCellChange={isPlanned ? undefined : handleCellChange}
        registerCellVisibilityNode={(cell, el) =>
          registerVisibilityNode(cell, 'floor', el)
        }
        rows={GRID.rows}
      >
        <GoalMarkerLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          registerVisibilityNode={(cell, el) =>
            registerVisibilityNode(cell, 'marker', el)
          }
          rows={GRID.rows}
        />
        <ObstacleLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          registerVisibilityNode={(cell, el) =>
            registerVisibilityNode(cell, 'marker', el)
          }
          rows={GRID.rows}
        />
        <OneWayLayer
          cols={GRID.cols}
          hexSize={HEX_SIZE}
          registerVisibilityNode={(cell, el) =>
            registerVisibilityNode(cell, 'marker', el)
          }
          rows={GRID.rows}
        />
        {isPlanned ? (
          <PlannedPathLayer
            canEnterCell={canEnterCell}
            cols={GRID.cols}
            currentCell={currentCell}
            hexSize={HEX_SIZE}
            isRunning={isRunning}
            rows={GRID.rows}
          />
        ) : (
          <MoveTargetLayer
            canEnterCell={canEnterCell}
            cols={GRID.cols}
            currentCell={currentCell}
            hexSize={HEX_SIZE}
            mode={displayMode}
            rows={GRID.rows}
          />
        )}
      </Stage07>
      <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
        <label>
          移動方式{' '}
          <select
            onChange={(event) => setMoveMode(event.target.value as MoveMode)}
            value={moveMode}
          >
            <option value="instant">即時移動</option>
            <option value="planned">予定経路 + 実行</option>
          </select>
        </label>
        <label>
          <input
            defaultChecked
            onChange={(event) => setShowVisited(event.target.checked)}
            type="checkbox"
          />{' '}
          到達済みマスを表示する
        </label>
        {!isPlanned && (
          <>
            <label>
              <input
                checked={enableWalking}
                onChange={(event) => setEnableWalking(event.target.checked)}
                type="checkbox"
              />{' '}
              歩行モーション
            </label>
            <label>
              移動可能マス表示{' '}
              <select
                onChange={(event) =>
                  setDisplayMode(event.target.value as MoveTargetDisplayMode)
                }
                value={displayMode}
              >
                <option value="scatter">散開</option>
                <option value="instant">即時</option>
                <option value="fade">フェード</option>
              </select>
            </label>
          </>
        )}
        <span hidden={!goalReached}>🎉 ゴール到達</span>
      </div>
      {isPlanned && (
        <ActionBar
          execute={execute}
          isRunning={isRunning}
          reachedGoal={reachedGoal}
        />
      )}
    </div>
  )
}

export default FindPathProto03
