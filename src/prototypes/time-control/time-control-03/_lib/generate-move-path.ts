import { MovePath, Position } from '../types'

/**
 * 現在地から目標地点までを、tick あたりの移動距離 (stepDistance) で刻んだ経路を生成する
 *
 * - `fixedSteps` 省略時: 到達地点 (`to`) を先に決定し、そこまでの距離を\
 *   `stepDistance` で割って step 数を算出する (距離ベース自動計算)。最終 step 以外は\
 *   必ず `stepDistance` ぶん進み、最終 step のみ端数を吸収して target に一致させる
 * - `fixedSteps` 指定時: 常にその step 数を使う。各 step は進行方向 (`from` → `to`) へ\
 *   必ず `stepDistance` ぶん進む。距離ベースの step 数より少なくても多くても指定値を\
 *   優先するため、target を超えて進む、または手前で止まりうる (02 の `minSteps` から、\
 *   「距離ベースを上回る場合のみ有効」という条件を外し常に固定する仕様に変更)
 *
 * @param from 現在地
 * @param to 目標地点 (進行方向の基準)
 * @param stepDistance tick あたりの移動距離 (speed * tickMs)
 * @param fixedSteps 経路の固定 step 数。省略時は距離ベースで自動算出する
 */
export const generateMovePath = (
  from: Position,
  to: Position,
  stepDistance: number,
  fixedSteps?: number,
): MovePath => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) {
    return []
  }

  const dirX = dx / distance
  const dirY = dy / distance

  if (fixedSteps !== undefined) {
    return Array.from({ length: fixedSteps }, (_, index) => {
      const traveled = (index + 1) * stepDistance

      return { x: from.x + dirX * traveled, y: from.y + dirY * traveled }
    })
  }

  const distanceBasedSteps = Math.ceil(distance / stepDistance)

  return Array.from({ length: distanceBasedSteps }, (_, index) => {
    const isLastStep = index === distanceBasedSteps - 1

    if (isLastStep) {
      return { x: to.x, y: to.y }
    }

    const traveled = (index + 1) * stepDistance

    return { x: from.x + dirX * traveled, y: from.y + dirY * traveled }
  })
}
