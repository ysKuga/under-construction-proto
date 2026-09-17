'use client'

import { useState } from 'react'

import {
  createEnergyStore,
  EnergyStoreContext,
  useEnergyStore,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { Stage07 } from '@/prototypes/stage/stage-07'
import { ActorNodeRegistryProvider } from '@/prototypes/stage/stage-07/_contexts/actor-node-registry'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { GoalMarkerLayer } from './_components/goal-marker-layer'
import {
  MoveTargetDisplayMode,
  MoveTargetLayer,
} from './_components/move-target-layer'
import { ObstacleLayer } from './_components/obstacle-layer'
import { OneWayLayer } from './_components/one-way-layer'
import {
  useVisibilityRegistry,
  VisibilityRegistryProvider,
} from './_contexts/visibility-registry'
import { isObstacleCell } from './_lib/obstacle'
import { isBlockedByOneWay } from './_lib/one-way'
import { GOAL_POSITION, START_POSITION } from './constants'

/** グリッド形状 */
const GRID = { cols: 5, rows: 5 } as const
/** 六角形の外接円半径 (px) */
const HEX_SIZE = 40

/** axial セルの一致判定 */
const isSameCell = (a: HexCell, b: HexCell) => a.q === b.q && a.r === b.r

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
 *   到着時の `walkingReset`（issue #162 の腕脚位置リセット action）により、
 *   1 マスごとの隣接クリック移動でも到着後に行進が続く不自然さが解消したため既定有効化。
 *   無効化との比較用にチェックボックスは残す
 * - `ActorNodeRegistryProvider`（hex 版）は actor の現在セルを保持する Provider。
 *   `Stage07` の外側に置く（issue #181 PR-A。tick 駆動実行の追加に備え、外部から
 *   クリックを介さず actor を動かせるようにするため）
 * - EN（エネルギー、issue #181）: 1 マス移動するごとに 1 消費する。予定経路・tick
 *   駆動の「実行」は proto-01 と異なり導入しない（1 マスごとの隣接クリック移動の
 *   まま）ため、`canEnterCell` へ残量判定を加え移動成立時に直接消費する
 */
const FindPathProto03 = () => {
  const [energyStore] = useState(() => createEnergyStore())

  return (
    <EnergyStoreContext.Provider value={energyStore}>
      <ActorNodeRegistryProvider initialCell={START_POSITION}>
        <VisibilityRegistryProvider>
          <FindPathProto03Content />
        </VisibilityRegistryProvider>
      </ActorNodeRegistryProvider>
    </EnergyStoreContext.Provider>
  )
}

/** `useVisibilityRegistry` を Provider の内側で呼び、UI へ配布する */
const FindPathProto03Content = () => {
  const [currentCell, setCurrentCell] = useState<HexCell>(START_POSITION)
  const [displayMode, setDisplayMode] =
    useState<MoveTargetDisplayMode>('scatter')
  const [enableWalking, setEnableWalking] = useState(true)
  const [goalReached, setGoalReached] = useState(false)
  const { markVisited, registerVisibilityNode, setShowVisited } =
    useVisibilityRegistry()
  const energyStoreApi = useEnergyStoreApi()
  const hasEnergy = useEnergyStore(
    (state) => state.getEnergyInfo(PLAYER_ACTOR_ID).current > 0,
  )

  const handleCellChange = (cell: HexCell) => {
    setCurrentCell(cell)
    markVisited(cell)
    energyStoreApi.getState().consume(PLAYER_ACTOR_ID, 1)

    if (isSameCell(cell, GOAL_POSITION)) {
      setGoalReached(true)
    }
  }

  /** 対象セルへ進入可能か（障害物・一方通行の逆走・EN 切れを除外） */
  const canEnterCell = (cell: HexCell) =>
    hasEnergy && !isObstacleCell(cell) && !isBlockedByOneWay(currentCell, cell)

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
        onCellChange={handleCellChange}
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
        <MoveTargetLayer
          canEnterCell={canEnterCell}
          cols={GRID.cols}
          currentCell={currentCell}
          hexSize={HEX_SIZE}
          mode={displayMode}
          rows={GRID.rows}
        />
      </Stage07>
      <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
        <label>
          <input
            defaultChecked
            onChange={(event) => setShowVisited(event.target.checked)}
            type="checkbox"
          />{' '}
          到達済みマスを表示する
        </label>
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
        <span hidden={!goalReached}>🎉 ゴール到達</span>
      </div>
    </div>
  )
}

export default FindPathProto03
