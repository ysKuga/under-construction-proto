'use client'

import { useState } from 'react'

import {
  faceAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { Stage06 } from '@/prototypes/stage/stage-06'
import { ActorNodeRegistryProvider } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
import { useInitialFacing } from '@/prototypes/stage/stage-06/_hooks/use-initial-facing'

import { GoalMarkerLayer } from '../proto-01/_components/goal-marker-layer'

import { AdjacentMoveLayer } from './_components/adjacent-move-layer'
import {
  useVisibilityRegistry,
  VisibilityRegistryProvider,
} from './_contexts/visibility-registry'
import { useAdjacentMove } from './_hooks/use-adjacent-move'
import { START_POSITION } from './constants'

/** グリッド形状（provider の gridSize と Stage06 の cols/rows で共有する） */
const GRID = { cols: 5, rows: 5 } as const

/**
 * 初期向き(画面角度、rad)。右下(45°)
 *
 * - 隣接判定による自動算出(右)だと顔(目)がカメラ側を向かず見えないため、
 *   `useInitialFacing` へ明示指定する
 */
const INITIAL_FACING_SCREEN_ANGLE = Math.PI / 4

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
 * - `VisibilityRegistryProvider` は未到達マスを非表示にするための Provider（proto-01
 *   と同型だが、bot 初期セルが `START_POSITION` のため別実装）。可視判定は「視界
 *   （現在地基準の8近傍）」または「到達済み表示ONかつ到達済みセル」（`setShowVisited`
 *   で切替可能、既定 ON）。`AdjacentMoveLayer`（セル選択の表示/非表示）・
 *   `GoalMarkerLayer`（旗の表示/非表示）・`useAdjacentMove`（到達記録）から読めるよう
 *   `Stage06` の外側に置く
 * - 現在セル・ゴール到達等の可変状態に `useState` を持たない。`useAdjacentMove`
 *   が ref で保持し DOM 直書きで反映するため、bot の移動で `Stage06` 配下は
 *   再レンダリングされない。確認チェックボックスも非制御（`defaultChecked` + ref）。
 *   face action 用 `eventTarget` の `useState` は setter を使わない実質 const
 *   （`BoxBotEventProvider` と同じ手法）のため、この方針に反しない
 * - 初期表示時は `useInitialFacing` に `INITIAL_FACING_SCREEN_ANGLE`(右下)を
 *   明示指定し、その向きへ固定する（自動算出だと右向きになり顔が見えないため）
 * - route (`/find-path`) / page 実装は未着手。確認は Storybook で行う
 */
const FindPathProto02 = () => {
  return (
    <ActorNodeRegistryProvider gridSize={GRID} initialPosition={START_POSITION}>
      <VisibilityRegistryProvider>
        <FindPathProto02Content />
      </VisibilityRegistryProvider>
    </ActorNodeRegistryProvider>
  )
}

/** `useAdjacentMove` を Provider の内側で呼び、UI へ配布する */
const FindPathProto02Content = () => {
  const {
    confirmCheckboxRef,
    diagonalCheckboxRef,
    goalMessageRef,
    handleCellClick,
    handleDiagonalToggle,
    registerCellNode,
    registerVisibilityNode,
  } = useAdjacentMove(GRID)
  const { registerVisibilityNode: registerCellVisibilityNode, setShowVisited } =
    useVisibilityRegistry()

  const [eventTarget] = useState<EventTarget>(() => new EventTarget())
  const { face } = useBoxBotActionDispatcher(eventTarget, [faceAction])

  useInitialFacing(face, GRID, INITIAL_FACING_SCREEN_ANGLE)

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Find Path (proto-02)
      </h1>
      <Stage06
        actorActions={[faceAction]}
        actorEventTarget={eventTarget}
        botSize={56}
        cols={GRID.cols}
        initialTiltDeg={55}
        interactive={false}
        perspectivePx={600}
        registerCellVisibilityNode={(cell, el) =>
          registerCellVisibilityNode(cell, 'floor', el)
        }
        rows={GRID.rows}
        size={400}
      >
        <GoalMarkerLayer
          cols={GRID.cols}
          registerVisibilityNode={(cell, el) =>
            registerCellVisibilityNode(cell, 'marker', el)
          }
          rows={GRID.rows}
        />
        <AdjacentMoveLayer
          cols={GRID.cols}
          onCellClick={handleCellClick}
          registerCellNode={registerCellNode}
          registerVisibilityNode={registerVisibilityNode}
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
        <label>
          <input
            defaultChecked={false}
            onChange={handleDiagonalToggle}
            ref={diagonalCheckboxRef}
            type="checkbox"
          />{' '}
          斜め移動を許可する
        </label>
        <label>
          <input
            defaultChecked
            onChange={(event) => setShowVisited(event.target.checked)}
            type="checkbox"
          />{' '}
          到達済みマスを表示する
        </label>
        <span hidden ref={goalMessageRef}>
          🎉 ゴール到達
        </span>
      </div>
    </div>
  )
}

export default FindPathProto02
