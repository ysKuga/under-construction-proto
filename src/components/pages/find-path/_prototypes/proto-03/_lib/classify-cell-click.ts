import {
  HexCell,
  isHexAdjacent,
  isSameHexCell,
} from '@/prototypes/stage/stage-07/_lib/hex'

import { WaypointFlowState } from '../_stores/waypoint-flow/types'

/**
 * セルクリックの分類
 *
 * - `current`: 現在マス。何もしない
 * - `move`: 直接移動できるマス（隣接・進入可）
 * - `cancel-objective`: 経路提示中の目標セルの再クリック。目標設定をキャンセルする
 * - `objective`: 上記以外。目標として経路を提示する（EN 切れによる拒否・到達不能もここに含む）
 */
export type CellClickKind = 'cancel-objective' | 'current' | 'move' | 'objective'

/** 分類に使う状態 */
export type CellClickContext = {
  /** 対象セルへ進入可能か（`Stage07` へ渡すものと同じ） */
  canEnterCell: (cell: HexCell) => boolean
  /** player の現在セル */
  currentCell: HexCell
  /** 目標設定の状態 */
  flowState: WaypointFlowState
  /** 経路提示中の目標セル */
  objectiveCell?: HexCell
}

/**
 * クリックしても何も起きないセルか
 *
 * - 選択可能表示（`cursor: pointer`）の判定にも使う。依存を `currentCell` のみに留め、\
 *   EN 等の変化で表示側を再レンダリングさせないため `classifyCellClick` から分けている
 *
 * @param cell クリックしたセル
 * @param currentCell player の現在セル
 */
export const isCellClickIgnored = (
  cell: HexCell,
  currentCell: HexCell,
): boolean => isSameHexCell(currentCell, cell)

/**
 * セルクリックを分類する
 *
 * - 同期で判定できる範囲のみ扱う。EN 切れによる拒否（`FindPath-propose-path`）・
 *   到達不能（BFS）は `objective` の処理側で判定する
 *
 * @param cell クリックしたセル
 * @param context 分類に使う状態
 */
export const classifyCellClick = (
  cell: HexCell,
  context: CellClickContext,
): CellClickKind => {
  const { canEnterCell, currentCell, flowState, objectiveCell } = context

  // 現在マス: 何もしない
  if (isCellClickIgnored(cell, currentCell)) return 'current'

  /** 直接移動できるか（隣接・進入可） */
  const isDirectMove = isHexAdjacent(currentCell, cell) && canEnterCell(cell)

  // 直接移動できる: 移動
  if (isDirectMove) return 'move'

  /** 経路提示中の目標セルを再クリックしたか */
  const isObjectiveReclick =
    flowState === 'proposing' &&
    objectiveCell !== undefined &&
    isSameHexCell(objectiveCell, cell)

  // 目標セルの再クリック: 目標設定のキャンセル
  if (isObjectiveReclick) return 'cancel-objective'

  return 'objective'
}
