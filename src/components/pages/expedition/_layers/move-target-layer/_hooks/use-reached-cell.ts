'use client'

import { useCallback, useState } from 'react'

import { useStage07EventListener } from '@/components/pages/expedition/_stage-components/hex-stage/_events'
import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'
import { Actor } from '@/types/theater/actor'

/**
 * actor が最後に中心へ到達したセルを返す
 *
 * - `Stage07-cell-reach` を購読して保持する。現在セル（進入開始時に切り替わる）と
 *   違い、bot が見た目上そのマスの中心に着いた時点で切り替わる
 * - 最初の到達通知（マウント直後）までは `undefined`
 *
 * @param actorId 対象 actor
 */
export const useReachedCell = (actorId: Actor['id']): HexCell | undefined => {
  const [reachedCell, setReachedCell] = useState<HexCell>()

  useStage07EventListener(
    'Stage07-cell-reach',
    useCallback(
      (event) => {
        if (event.detail.actorId !== actorId) return

        setReachedCell(event.detail.cell)
      },
      [actorId],
    ),
    // 経路プレビュー（進行の記録）・移動可能マスの表示が同じイベントを購読するため
    { allowMultiple: true },
  )

  return reachedCell
}
