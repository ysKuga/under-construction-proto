import { GridPosition } from '../_contexts/actor-node-registry'

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
