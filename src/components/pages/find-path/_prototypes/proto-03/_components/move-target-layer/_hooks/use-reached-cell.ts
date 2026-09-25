'use client'

import { useCallback, useState } from 'react'

import { useStage07EventListener } from '@/prototypes/stage/stage-07/_events'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { ActorId } from '@/prototypes/time-control/time-control-03/types'

/**
 * actor が最後に中心へ到達したセルを返す
 *
 * - `Stage07-cell-reach` を購読して保持する。現在セル（進入開始時に切り替わる）と
 *   違い、bot が見た目上そのマスの中心に着いた時点で切り替わる
 * - 最初の到達通知（マウント直後）までは `undefined`
 *
 * @param actorId 対象 actor
 */
export const useReachedCell = (actorId: ActorId): HexCell | undefined => {
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
  )

  return reachedCell
}
