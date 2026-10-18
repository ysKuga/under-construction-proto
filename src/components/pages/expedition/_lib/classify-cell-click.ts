import { isCellSelectable } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/cell-selectable'
import {
  HexCell,
  isHexAdjacent,
  isSameHexCell,
} from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'

import { WaypointFlowState } from '../_stores/waypoint-flow/types'

/**
 * セルクリックの分類
 *
 * - `current`: 現在マス。何もしない
 * - `cancel-objective`: 経路提示中の目標セルの再クリック。目標設定をキャンセルする
 * - `move`: 隣接マス。移動を試みる（進入可否は `HexStageHandle.moveTo` が判定し、拒否されたら目標として扱う）
 * - `objective`: 上記以外。目標として経路を提示する（EN 切れによる拒否・到達不能もここに含む）
 */
export type CellClickKind =
  | 'cancel-objective'
  | 'current'
  | 'move'
  | 'objective'

/** 分類に使う状態 */
export type CellClickContext = {
  /** player の現在セル */
  currentCell: HexCell
  /** 目標設定の状態 */
  flowState: WaypointFlowState
  /** 経路提示中の目標セル */
  objectiveCell?: HexCell
}

/**
 * セルクリックを分類する
 *
 * - 現在マス判定は `HexStage` の選択可能表示と同じ `isCellSelectable` を使う
 * - 目標セルの再クリックは隣接判定より先に見る。目標になる隣接マスは進入不可のマス
 *   （障害物・一方通行の壁）のみのため、移動を試みる前にキャンセルとして扱う
 * - 進入可否は扱わない。`moveTo` の判定と二重にしないため
 * - 同期で判定できる範囲のみ扱う。EN 切れによる拒否（`Expedition-propose-path`）・
 *   到達不能（BFS）は `objective` の処理側で判定する
 *
 * @param cell クリックしたセル
 * @param context 分類に使う状態
 */
export const classifyCellClick = (
  cell: HexCell,
  context: CellClickContext,
): CellClickKind => {
  const { currentCell, flowState, objectiveCell } = context

  /** クリックで何かが起きるセルか（現在マス以外、`HexStage` の選択可能表示と同じ判定） */
  const selectable = isCellSelectable(cell, currentCell)

  // 現在マス: 何もしない
  if (!selectable) return 'current'

  /** 経路提示中の目標セルを再クリックしたか */
  const isObjectiveReclick =
    flowState === 'proposing' &&
    objectiveCell !== undefined &&
    isSameHexCell(objectiveCell, cell)

  // 目標セルの再クリック: 目標設定のキャンセル
  if (isObjectiveReclick) return 'cancel-objective'

  // 隣接マス: 移動を試みる
  if (isHexAdjacent(currentCell, cell)) return 'move'

  return 'objective'
}
