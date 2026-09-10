'use client'

import { Stage05 } from '@/prototypes/stage/stage-05'

import { FindPathStoresProvider } from './_contexts/find-path-stores'

/**
 * FindPathProto01 — find-path ページ試作
 *
 * - stage-05 (遠近ステージ + box-bot actor) をページ枠へマウントした土台
 * - `FindPathStoresProvider` で time-control-03 の game-clock / path / planned-path を配線
 *   （tick は未接続。PR-C で「実行」と合わせて載せる）
 * - route (`/find-path`) / page 実装は未着手。確認は Storybook で行う
 * - stage-06 (ref 位置版) への差し替え・ゴール到達判定・経路積み UI は段階 3 以降
 */
const FindPathProto01 = () => {
  return (
    <FindPathStoresProvider>
      <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Find Path
        </h1>
        <Stage05
          botSize={56}
          cols={5}
          initialTiltDeg={55}
          perspectivePx={600}
          rows={5}
          size={400}
        />
      </div>
    </FindPathStoresProvider>
  )
}

export default FindPathProto01
