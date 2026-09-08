'use client'

import { Stage05 } from '@/prototypes/stage/stage-05'

/**
 * FindPathProto01 — find-path ページ試作
 *
 * - stage-05 (遠近ステージ + box-bot actor) をページ枠へマウントしただけの土台
 * - route (`/find-path`) / page 実装は未着手。確認は Storybook で行う
 * - time-control 連携・ゴール到達判定・経路積み UI は段階 3 以降
 */
const FindPathProto01 = () => {
  return (
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
  )
}

export default FindPathProto01
