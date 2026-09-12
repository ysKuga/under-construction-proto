'use client'

import { Stage06 } from '@/prototypes/stage/stage-06'
import { ActorNodeRegistryProvider } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

import { ActionBar } from './_components/action-bar'
import { GoalMarkerLayer } from './_components/goal-marker-layer'
import { PlannedPathLayer } from './_components/planned-path-layer'
import { FindPathStoresProvider } from './_contexts/find-path-stores'
import { PlannedPathCellRegistryProvider } from './_contexts/planned-path-cell-registry'
import { useFindPathTick } from './_hooks/use-find-path-tick'

/** グリッド形状（provider の gridSize と Stage06 の cols/rows で共有する） */
const GRID = { cols: 5, rows: 5 } as const

/**
 * FindPathProto01 — find-path ページ試作
 *
 * - stage-06 (遠近ステージ + actor 位置 ref 版) をページ枠へマウントした土台
 * - `ActorNodeRegistryProvider` は Stage06 の外側に置く。tick ドライバ・「実行」
 *   ボタン（`ActionBar`）が `moveActor` を Stage06 と同じ Context から読めるようにするため
 * - `FindPathStoresProvider` で time-control-03 の game-clock / path / planned-path を配線
 * - `Stage06` は `interactive={false}`。セルクリックは `PlannedPathLayer`（予定経路の
 *   積み込み）へ委ね、「実行」で tick 進行 → bot が 1 手ずつ歩く。`GoalMarkerLayer` は
 *   ゴールセル表示のみの非対話層
 * - ゴール到達判定は `useFindPathTick`（`ActionBar` 経由で使用）が tick 消化のたびに行う
 * - `PlannedPathCellRegistryProvider` は `PlannedPathLayer`（セル DOM 登録）と
 *   `useFindPathTick`（到達セルフェードアウト）双方から読めるよう `Stage06` の外側に置く
 * - route (`/find-path`) / page 実装は未着手。確認は Storybook で行う
 */
const FindPathProto01 = () => {
  return (
    <FindPathStoresProvider>
      <ActorNodeRegistryProvider gridSize={GRID}>
        <PlannedPathCellRegistryProvider>
          <FindPathContent />
        </PlannedPathCellRegistryProvider>
      </ActorNodeRegistryProvider>
    </FindPathStoresProvider>
  )
}

/**
 * `useFindPathTick` を Provider 群の内側で呼び、`ActionBar` と `PlannedPathLayer`
 * 双方へ props で配布する
 *
 * - `isRunning`: tick 走行中は `PlannedPathLayer` のセル選択を止める。走行中に
 *   追加した指定は実行用の残り経路（path store）へ反映されず「消化されない指定」に
 *   なってしまうため
 */
const FindPathContent = () => {
  const { execute, isRunning, reachedGoal } = useFindPathTick()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Find Path
      </h1>
      <Stage06
        botSize={56}
        cols={GRID.cols}
        initialTiltDeg={55}
        interactive={false}
        perspectivePx={600}
        rows={GRID.rows}
        size={400}
      >
        <GoalMarkerLayer cols={GRID.cols} rows={GRID.rows} />
        <PlannedPathLayer
          cols={GRID.cols}
          isRunning={isRunning}
          rows={GRID.rows}
        />
      </Stage06>
      <ActionBar
        execute={execute}
        isRunning={isRunning}
        reachedGoal={reachedGoal}
      />
    </div>
  )
}

export default FindPathProto01
