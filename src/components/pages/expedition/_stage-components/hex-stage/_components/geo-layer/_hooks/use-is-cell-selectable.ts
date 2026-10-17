import { useCallback } from 'react'

import { PLAYER_ACTOR_ID } from '../../../constants'
import { isCellSelectable } from '../../../_lib/cell-selectable'
import { HexCell } from '../../../_lib/hex'
import { useActorsStore } from '../../../_stores/actors'

/**
 * セルを選択可能表示（`cursor: pointer`）にするかの判定を返す
 *
 * - `_lib/cell-selectable` の `isCellSelectable` を player の現在セルで束縛する。\
 *   クリックを分類する呼び出し側（find-path proto-03 の `classifyCellClick` 等）も同じ関数を使い揃える
 * - 現在セルの変化で新しい参照になる（`GeoLayer` は移動のたび再レンダリングされる）
 */
export const useIsCellSelectable = (): ((cell: HexCell) => boolean) => {
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])

  return useCallback(
    (cell: HexCell) => isCellSelectable(cell, currentCell),
    [currentCell],
  )
}
