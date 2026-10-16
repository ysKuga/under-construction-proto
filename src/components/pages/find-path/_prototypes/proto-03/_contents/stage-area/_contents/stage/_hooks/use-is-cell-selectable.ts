import { useCallback } from 'react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { isCellClickIgnored } from '../../../../../_lib/classify-cell-click'
import { UseStageReturn } from '../index.types'

/**
 * セルの選択可能表示（`cursor: pointer`）の判定を返す
 *
 * - クリックの分類（`classifyCellClick`）と同じ元（`isCellClickIgnored`）から判定する
 * - 依存は現在セルのみ。EN・目標設定の状態は含めない（どの分類でもクリックで反応が起き、\
 *   含めると `GeoLayer` の再レンダリングが増えるため）
 */
export const useIsCellSelectable = (): UseStageReturn['isCellSelectable'] => {
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])

  return useCallback(
    (cell: HexCell) => !isCellClickIgnored(cell, currentCell),
    [currentCell],
  )
}
