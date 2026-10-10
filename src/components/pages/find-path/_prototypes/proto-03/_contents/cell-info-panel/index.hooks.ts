import { term } from '@/features/term-registry'

import { describeCellContent } from '../../_lib/describe-cell-content'
import { getCellContents } from '../../_lib/get-cell-contents'
import { isSameCell } from '../../_lib/is-same-cell'
import { getItemPresentation } from '../../_lib/item-presentation'
import { useItemStore } from '../../_stores/items'
import { CellContent } from '../../_stores/items/types'
import { useWaypointFlowStore } from '../../_stores/waypoint-flow'
import { OBJECTIVE_CANCEL_TITLE } from '../stage-area/_contents/stage/_hooks/use-get-cell-title'

import { useHoveredCell } from './_hooks/use-hovered-cell'
import { CellInfoEntry, UseCellInfoPanelReturn } from './index.types'

/** セル上の要素をパネルの表示要素へ変換する */
const toCellInfoEntry = (content: CellContent): CellInfoEntry =>
  content.kind === 'obstacle'
    ? {
        description: describeCellContent(content),
        icon: term.obstacle.icon,
        key: 'obstacle',
      }
    : {
        description: describeCellContent(content),
        icon: getItemPresentation(content.item).icon,
        key: content.item.id,
        status:
          content.item.stock !== undefined
            ? `残り ${content.item.stock} 回`
            : undefined,
      }

/**
 * hover 中セルの内包要素一覧・操作ヒントを組み立てる
 *
 * - hover 中セル・アイテム・中継点フローの変化で、パネルのみ再レンダリングする
 */
export const useCellInfoPanel = (): UseCellInfoPanelReturn => {
  const { hoveredCell } = useHoveredCell()
  const itemState = useItemStore((state) => state)
  /** 経路提示中の目標セル（中継点選択中などキャンセル不可の状態では `undefined`） */
  const cancelableObjectiveCell = useWaypointFlowStore((state) =>
    state.flowState === 'proposing' ? state.objectiveCell : undefined,
  )

  // hover なし: 一覧・ヒントを出さない
  if (!hoveredCell) {
    return { entries: [], hoveredCell }
  }

  /** hover 中セルが、再クリックでキャンセルできる目標セルか */
  const isCancelableObjective =
    cancelableObjectiveCell !== undefined &&
    isSameCell(cancelableObjectiveCell, hoveredCell)

  return {
    entries: getCellContents(hoveredCell, itemState).map(toCellInfoEntry),
    hint: isCancelableObjective ? OBJECTIVE_CANCEL_TITLE : undefined,
    hoveredCell,
  }
}
