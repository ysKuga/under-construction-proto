import { MovePath, Position } from '../types'

/**
 * 現在地から目標地点までを、tick あたりの移動距離 (stepDistance) で刻んだ経路を生成する
 *
 * - `minSteps` が距離基準の step 数 (`distance / stepDistance` の切り上げ) 以下、\
 *   または `minSteps` が 0 (未使用) の場合: 到達地点 (`to`) を先に決定し、そこまでの\
 *   距離を `stepDistance` で割って step 数を算出する。最終 step 以外は必ず\
 *   `stepDistance` ぶん進み、最終 step のみ端数を吸収して target に一致させる
 * - `minSteps` が距離基準の step 数を上回る場合: step 数 (`minSteps`) を先に決定し、\
 *   各 step は進行方向 (`from` → `to`) へ必ず `stepDistance` ぶん進む。\
 *   この場合 target を超えて進みうる (至近距離での移動調整を想定した例外経路)
 *
 * @param from 現在地
 * @param to 目標地点 (進行方向の基準)
 * @param stepDistance tick あたりの移動距離 (speed * tickMs)
 * @param minSteps 経路の最低 step 数。0 は未使用
 */
export const generateMovePath = (
  from: Position,
  to: Position,
  stepDistance: number,
  minSteps = 0,
): MovePath => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) {
    return []
  }

  const dirX = dx / distance
  const dirY = dy / distance
  const distanceBasedSteps = Math.ceil(distance / stepDistance)

  if (minSteps > distanceBasedSteps) {
    return Array.from({ length: minSteps }, (_, index) => {
      const traveled = (index + 1) * stepDistance

      return { x: from.x + dirX * traveled, y: from.y + dirY * traveled }
    })
  }

  return Array.from({ length: distanceBasedSteps }, (_, index) => {
    const isLastStep = index === distanceBasedSteps - 1

    if (isLastStep) {
      return { x: to.x, y: to.y }
    }

    const traveled = (index + 1) * stepDistance

    return { x: from.x + dirX * traveled, y: from.y + dirY * traveled }
  })
}
