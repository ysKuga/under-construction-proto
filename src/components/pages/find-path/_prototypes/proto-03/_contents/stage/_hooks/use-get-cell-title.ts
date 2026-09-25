import { useCallback } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { describeCellContent } from '../../../_lib/describe-cell-content'
import { getCellContents } from '../../../_lib/get-cell-contents'
import { useItemStoreApi } from '../../../_stores/items'
import { UseStageReturn } from '../index.types'

/**
 * セル hover 時の説明（障害物・アイテム）を返す関数を返す
 *
 * - stage-07 は find-path 固有の概念を持たないため、`CellTitleProvider` 経由で
 *   `GeoLayer` のセル本体の `title` へ注入する（PR #196 レビュー対応）
 */
export const useGetCellTitle = (): UseStageReturn['getCellTitle'] => {
  const itemStoreApi = useItemStoreApi()

  return useCallback(
    (cell: HexCell) => {
      const contents = getCellContents(cell, itemStoreApi.getState())

      return contents[0] && describeCellContent(contents[0])
    },
    [itemStoreApi],
  )
}
