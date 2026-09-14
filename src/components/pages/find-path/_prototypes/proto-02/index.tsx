'use client'

import { Stage06 } from '@/prototypes/stage/stage-06'
import { ActorNodeRegistryProvider } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

import { GoalMarkerLayer } from '../proto-01/_components/goal-marker-layer'

import { AdjacentMoveLayer } from './_components/adjacent-move-layer'
import { useAdjacentMove } from './_hooks/use-adjacent-move'
import { START_POSITION } from './constants'

/** グリッド形状（provider の gridSize と Stage06 の cols/rows で共有する） */
const GRID = { cols: 5, rows: 5 } as const

/**
 * FindPathProto02 — find-path ページ試作（隣接クリック逐次移動版）
 *
 * - proto-01（`planned-path` へ積み上げ → まとめて「実行」）とは別方式の試作。
 *   隣接セルをクリックするたびに 1 手ずつ即時移動する
 * - time-control-03 の store 群・tick ループは持ち込まない。移動アニメーションは
 *   `ActorsLayer` の CSS transition のみで足り、`useAdjacentMove` が
 *   `moveActor`（DOM 直書き）を都度呼ぶだけで完結する
 * - `Stage06` は `interactive={false}`。セルクリックは `AdjacentMoveLayer`
 *   （隣接判定・確認ダイアログ）へ委ねる。`GoalMarkerLayer` は proto-01 と共用
 * - **`useState` を持たない**。`useAdjacentMove` が現在セル・ゴール到達を ref で
 *   保持し DOM 直書きで反映するため、bot の移動で `Stage06` 配下は再レンダリング
 *   されない。確認チェックボックスも非制御（`defaultChecked` + ref）
 * - route (`/find-path`) / page 実装は未着手。確認は Storybook で行う
 */
const FindPathProto02 = () => {
  return (
    <ActorNodeRegistryProvider gridSize={GRID} initialPosition={START_POSITION}>
      <FindPathProto02Content />
    </ActorNodeRegistryProvider>
  )
}

/** `useAdjacentMove` を Provider の内側で呼び、UI へ配布する */
const FindPathProto02Content = () => {
  const {
    confirmCheckboxRef,
    goalMessageRef,
    handleCellClick,
    registerCellNode,
  } = useAdjacentMove(GRID)

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Find Path (proto-02)
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
        <AdjacentMoveLayer
          cols={GRID.cols}
          onCellClick={handleCellClick}
          registerCellNode={registerCellNode}
          rows={GRID.rows}
        />
      </Stage06>
      <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
        <label>
          <input
            defaultChecked={false}
            ref={confirmCheckboxRef}
            type="checkbox"
          />{' '}
          移動前に確認する
        </label>
        <span hidden ref={goalMessageRef}>
          🎉 ゴール到達
        </span>
      </div>
    </div>
  )
}

export default FindPathProto02
