import { useEnergyStore } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { term } from '@/features/term-registry'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { describeCellContent } from '../../../../_lib/describe-cell-content'
import { getCellContents } from '../../../../_lib/get-cell-contents'
import { isSameCell } from '../../../../_lib/is-same-cell'
import { getItemPresentation } from '../../../../_lib/item-presentation'
import { useGoalStore } from '../../../../_stores/goal'
import { useItemStore } from '../../../../_stores/items'
import { CellContent } from '../../../../_stores/items/types'
import { useWaypointFlowStore } from '../../../../_stores/waypoint-flow'
import { GOAL_POSITION } from '../../../../constants'

import { useHoveredCell } from './_hooks/use-hovered-cell'
import { CellInfoEntry, UseCellInfoPanelReturn } from './index.types'

/** 経路提示中の目標セルの操作ヒント（再クリックでキャンセルできる旨） */
export const OBJECTIVE_CANCEL_HINT = 'クリックで目標設定をキャンセル'

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
 * - 一覧の並び: bot → ゴール → セル上の要素（障害物・アイテム）
 * - hover 中セル・アイテム・中継点フローの変化で、パネルのみ再レンダリングする
 * - bot・ゴールの状態は hover 中セルにある時だけ購読値が変わる。\
 *   hover 中セル以外での移動・EN 変化では再レンダリングしない
 */
export const useCellInfoPanel = (): UseCellInfoPanelReturn => {
  const { hoveredCell } = useHoveredCell()
  const itemState = useItemStore((state) => state)
  /** 経路提示中の目標セル（中継点選択中などキャンセル不可の状態では `undefined`） */
  const cancelableObjectiveCell = useWaypointFlowStore((state) =>
    state.flowState === 'proposing' ? state.objectiveCell : undefined,
  )

  /** hover 中セルに bot がいるか */
  const isBotHovered = useActorsStore((state) => {
    const botCell = state.actors[PLAYER_ACTOR_ID]

    return (
      hoveredCell !== undefined &&
      botCell !== undefined &&
      isSameCell(botCell, hoveredCell)
    )
  })
  /** hover 中セルにいる bot の EN 表示（bot がいなければ `undefined`） */
  const botEnergyStatus = useEnergyStore((state) => {
    // bot が hover 中セルにいない: EN の変化で再レンダリングさせない
    if (!isBotHovered) {
      return undefined
    }

    const { current, max } = state.getEnergyInfo(PLAYER_ACTOR_ID)

    return `${term.energy.abbreviation} ${current}/${max}`
  })
  /** ゴールへ到達済みか */
  const goalReached = useGoalStore((state) => state.reached)

  // hover なし: 一覧・ヒントを出さない
  if (!hoveredCell) {
    return { entries: [], hoveredCell }
  }

  /** bot の表示要素（hover 中セルにいなければ `undefined`） */
  const botEntry: CellInfoEntry | undefined = isBotHovered
    ? { description: 'bot', icon: '🤖', key: 'bot', status: botEnergyStatus }
    : undefined
  /** ゴールの表示要素（hover 中セルがゴールでなければ `undefined`） */
  const goalEntry: CellInfoEntry | undefined = isSameCell(
    GOAL_POSITION,
    hoveredCell,
  )
    ? {
        description: 'ゴール',
        icon: '🚩',
        key: 'goal',
        status: goalReached ? '到達済み' : undefined,
      }
    : undefined

  /** hover 中セルが、再クリックでキャンセルできる目標セルか */
  const isCancelableObjective =
    cancelableObjectiveCell !== undefined &&
    isSameCell(cancelableObjectiveCell, hoveredCell)

  return {
    entries: [
      botEntry,
      goalEntry,
      ...getCellContents(hoveredCell, itemState).map(toCellInfoEntry),
    ].filter((entry) => entry !== undefined),
    hint: isCancelableObjective ? OBJECTIVE_CANCEL_HINT : undefined,
    hoveredCell,
  }
}
