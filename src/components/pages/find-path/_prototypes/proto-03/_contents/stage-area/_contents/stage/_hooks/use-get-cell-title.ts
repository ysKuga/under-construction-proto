import { useCallback } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { describeCellContent } from '../../../../../_lib/describe-cell-content'
import { getCellContents } from '../../../../../_lib/get-cell-contents'
import { useItemStoreApi } from '../../../../../_stores/items'
import { useWaypointFlowStore } from '../../../../../_stores/waypoint-flow'
import { UseStageReturn } from '../index.types'

/** 経路提示中の目標セルの hover 説明（再クリックでキャンセルできる旨） */
export const OBJECTIVE_CANCEL_TITLE = 'クリックで目標設定をキャンセル'

/**
 * セル hover 時の説明（障害物・アイテム）を返す関数を返す
 *
 * - stage-07 は find-path 固有の概念を持たないため、`CellTitleProvider` 経由で
 *   `GeoLayer` のセル本体の `title` へ注入する（PR #196 レビュー対応）
 * - 経路提示中の目標セルには、再クリックでキャンセルできる旨を先頭に加える
 *   （`useHandleNonAdjacentClick` のキャンセルに対応）。目標の変化で関数が
 *   作り直され `GeoLayer` が再レンダリングされるが、目標の設定・解除時のみ
 */
export const useGetCellTitle = (): UseStageReturn['getCellTitle'] => {
  const itemStoreApi = useItemStoreApi()
  /** 経路提示中の目標セル（中継点選択中などキャンセル不可の状態では `undefined`） */
  const cancelableObjectiveCell = useWaypointFlowStore((state) =>
    state.flowState === 'proposing' ? state.objectiveCell : undefined,
  )

  return useCallback(
    (cell: HexCell) => {
      const contents = getCellContents(cell, itemStoreApi.getState())
      const isCancelableObjective =
        cancelableObjectiveCell?.q === cell.q &&
        cancelableObjectiveCell.r === cell.r
      const titles = [
        isCancelableObjective ? OBJECTIVE_CANCEL_TITLE : undefined,
        contents[0] && describeCellContent(contents[0]),
      ].filter((title) => title !== undefined)

      return titles.length > 0 ? titles.join('\n') : undefined
    },
    [cancelableObjectiveCell, itemStoreApi],
  )
}
