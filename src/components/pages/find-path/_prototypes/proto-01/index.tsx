'use client'

import { ComponentProps, useState } from 'react'

import {
  faceAction,
  useBoxBotActionDispatcher,
  walkingAction,
} from '@/components/theater/figure/box-bot'
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
type FindPathProto01Props = {
  /**
   * `PlannedPathLayer` の重複選択許可（比較試作、既定は `PlannedPathLayer` に委ねる）
   */
  plannedPathAllowDuplicateSelection?: ComponentProps<
    typeof PlannedPathLayer
  >['allowDuplicateSelection']
  /** `PlannedPathLayer` の番号表示方式（比較試作、既定は `PlannedPathLayer` に委ねる） */
  plannedPathVariant?: ComponentProps<typeof PlannedPathLayer>['variant']
}

const FindPathProto01 = (props: FindPathProto01Props) => {
  const { plannedPathAllowDuplicateSelection, plannedPathVariant } = props

  return (
    <FindPathStoresProvider>
      <ActorNodeRegistryProvider gridSize={GRID}>
        <PlannedPathCellRegistryProvider variant={plannedPathVariant}>
          <FindPathContent
            plannedPathAllowDuplicateSelection={
              plannedPathAllowDuplicateSelection
            }
            plannedPathVariant={plannedPathVariant}
          />
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
 * - walking action(歩行モーション)は「実行」開始 〜 歩き切りを 1 周期として on/off
 *   する（`useFindPathTick` へ dispatcher を渡す）。複数マスを連続で歩く tick 駆動と
 *   相性がよい（1 マスごとの隣接クリック移動、stage-07 とは異なる粒度）
 * - face action(進行方向転換)は 1 tick 消化ごとに bot を進行方向へ向ける
 *   （`useFindPathTick` へ dispatcher を渡す。stage-07 と同じ考え方）
 */
const FindPathContent = (props: FindPathProto01Props) => {
  const { plannedPathAllowDuplicateSelection, plannedPathVariant } = props

  const [actorEventTarget] = useState<EventTarget>(() => new EventTarget())
  const { face, walking } = useBoxBotActionDispatcher(actorEventTarget, [
    faceAction,
    walkingAction,
  ])

  const { execute, isRunning, reachedGoal } = useFindPathTick({
    face,
    walking,
  })

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Find Path
      </h1>
      <Stage06
        actorActions={[faceAction, walkingAction]}
        actorEventTarget={actorEventTarget}
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
          allowDuplicateSelection={plannedPathAllowDuplicateSelection}
          cols={GRID.cols}
          isRunning={isRunning}
          rows={GRID.rows}
          variant={plannedPathVariant}
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
