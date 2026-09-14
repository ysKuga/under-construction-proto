'use client'

import { useState } from 'react'

import { Stage07 } from '@/prototypes/stage/stage-07'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { GoalMarkerLayer } from './_components/goal-marker-layer'
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
 * - visibility（視界による未到達マス非表示）・確認ダイアログは対象外（別途検討）
 */
const FindPathProto03 = () => {
  const [goalReached, setGoalReached] = useState(false)

  const handleCellChange = (cell: HexCell) => {
    if (isSameCell(cell, GOAL_POSITION)) {
      setGoalReached(true)
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Find Path (proto-03 / hex)
      </h1>
      <Stage07
        botSize={56}
        cols={GRID.cols}
        hexSize={HEX_SIZE}
        initialCell={START_POSITION}
        initialTiltDeg={55}
        onCellChange={handleCellChange}
        rows={GRID.rows}
      >
        <GoalMarkerLayer cols={GRID.cols} hexSize={HEX_SIZE} rows={GRID.rows} />
      </Stage07>
      <span hidden={!goalReached}>🎉 ゴール到達</span>
    </div>
  )
}

export default FindPathProto03
