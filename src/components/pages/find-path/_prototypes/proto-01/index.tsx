'use client'

import { Stage06 } from '@/prototypes/stage/stage-06'
import { ActorNodeRegistryProvider } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

import { FindPathStoresProvider } from './_contexts/find-path-stores'

/** グリッド形状（provider の gridSize と Stage06 の cols/rows で共有する） */
const GRID = { cols: 5, rows: 5 } as const

/**
 * FindPathProto01 — find-path ページ試作
 *
 * - stage-06 (遠近ステージ + actor 位置 ref 版) をページ枠へマウントした土台
 * - `ActorNodeRegistryProvider` は Stage06 の外側に置く。tick ドライバ・「実行」
 *   ボタン（PR-C）が `moveActor` を Stage06 と同じ Context から読めるようにするため
 * - `FindPathStoresProvider` で time-control-03 の game-clock / path / planned-path を配線
 * - route (`/find-path`) / page 実装は未着手。確認は Storybook で行う
 * - ゴール到達判定・経路積み UI・tick 実行は段階 3 PR-C 以降
 */
const FindPathProto01 = () => {
  return (
    <FindPathStoresProvider>
      <ActorNodeRegistryProvider gridSize={GRID}>
        <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Find Path
          </h1>
          <Stage06
            botSize={56}
            cols={GRID.cols}
            initialTiltDeg={55}
            perspectivePx={600}
            rows={GRID.rows}
            size={400}
          />
        </div>
      </ActorNodeRegistryProvider>
    </FindPathStoresProvider>
  )
}

export default FindPathProto01
