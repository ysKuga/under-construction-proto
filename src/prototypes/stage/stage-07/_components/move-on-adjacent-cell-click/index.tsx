'use client'

import { useCallback } from 'react'

import { useStage07HandleRef } from '../../_contexts/stage07-handle'
import { useStage07EventListener } from '../../_events'

/**
 * セルのクリックで、隣接セルなら player を移動させる
 *
 * - `Stage07-cell-click` を購読し、context の handle（`Stage07HandleProvider`）の `moveTo` を呼ぶ
 * - 現在セル・非隣接・進入不可は `moveTo` が `false` を返すのみで、何もしない
 * - クリックの分類を持たない `Stage07` を単体（story 等）で動かすための既定の挙動。\
 *   find-path proto-03 のように独自の分類を持つ呼出し側では置かない
 * - `Stage07HandleProvider`・`Stage07EventProvider` の内側へ置く。描画はしない
 */
export const MoveOnAdjacentCellClick = () => {
  const stage07HandleRef = useStage07HandleRef()

  useStage07EventListener(
    'Stage07-cell-click',
    useCallback(
      (event) => {
        stage07HandleRef.current?.moveTo(event.detail.cell)
      },
      [stage07HandleRef],
    ),
  )

  return null
}
