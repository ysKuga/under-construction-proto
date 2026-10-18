'use client'

import { useCallback } from 'react'

import { useHexStageHandleRef } from '../../_contexts/hex-stage-handle'
import { useHexStageEventListener } from '../../_events'

/**
 * セルのクリックで、隣接セルなら player を移動させる
 *
 * - `HexStage-cell-click` を購読し、context の handle（`HexStageHandleProvider`）の `moveTo` を呼ぶ
 * - 現在セル・非隣接・進入不可は `moveTo` が `false` を返すのみで、何もしない
 * - クリックの分類を持たない `HexStage` を単体（story 等）で動かすための既定の挙動。\
 *   find-path proto-03 のように独自の分類を持つ呼出し側では置かない
 * - `HexStageHandleProvider`・`HexStageEventProvider` の内側へ置く。描画はしない
 */
export const MoveOnAdjacentCellClick = () => {
  const hexStageHandleRef = useHexStageHandleRef()

  useHexStageEventListener(
    'HexStage-cell-click',
    useCallback(
      (event) => {
        hexStageHandleRef.current?.moveTo(event.detail.cell)
      },
      [hexStageHandleRef],
    ),
  )

  return null
}
