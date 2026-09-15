import { GridPosition, GridSize } from '../_contexts/actor-node-registry'

/**
 * 移動元→移動先セルの方向を、画面上の角度(rad、atan2 基準: 0 = 右、π/2 = 下)へ変換する
 *
 * - 矩形グリッドは col/row の差分がそのまま画面上の x/y 差分になるため、hex(`stage-07`
 *   の `hexDirectionToScreenAngle`)と違い座標変換は不要
 * - box-bot-01 の yaw への変換は行わない。box-bot-01 のカメラモデルを知らない疎結合を
 *   保つため、呼び出し側が `screenAngleToYaw`（box-bot-01 側）でこの画面角度を変換する
 */
export const gridDirectionToScreenAngle = (
  from: GridPosition,
  to: GridPosition,
): number => {
  const dx = to.col - from.col
  const dy = to.row - from.row

  return Math.atan2(dy, dx)
}

/** 隣接4方向のオフセット。画面角度 0(右)基準の時計回り順 */
const FACING_PRIORITY: readonly GridPosition[] = [
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: -1, row: 0 },
  { col: 0, row: -1 },
]

/**
 * 初期向き先のセルを、進入可能(グリッド範囲内)な隣接セルから優先順に選ぶ
 *
 * - `FACING_PRIORITY`(画面角度 0 = 右から時計回り)の順で走査し、最初に見つかった
 *   グリッド内の隣接セルを返す。隅セル等で既定の向き先が範囲外(進入不可)のときに使う
 * - 全方向とも範囲外(1x1 グリッド等)なら `undefined`
 */
export const pickInitialFacingTarget = (
  cell: GridPosition,
  gridSize: GridSize,
): GridPosition | undefined =>
  FACING_PRIORITY.map((delta) => ({
    col: cell.col + delta.col,
    row: cell.row + delta.row,
  })).find(
    (target) =>
      target.col >= 0 &&
      target.col < gridSize.cols &&
      target.row >= 0 &&
      target.row < gridSize.rows,
  )
