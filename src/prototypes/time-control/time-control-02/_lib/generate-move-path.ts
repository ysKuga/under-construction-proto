import { MovePath, Position } from '../types'

/**
 * 現在地から目標地点までを、tick あたりの移動距離 (stepDistance) で刻んだ経路を生成する
 *
 * - 最終 step 以外は必ず `stepDistance` ぶん (= actor の移動可能距離いっぱい) 進む。\
 *   最終 step のみ端数を吸収して target に一致させる (目的地前の減速・最終調整)
 * - 距離が短く `stepDistance` から求めた step 数が `minSteps` 未満になる場合のみ、\
 *   例外的に均等分割で `minSteps` を満たす (この場合は step ごとの移動距離が\
 *   `stepDistance` より短くなる)
 *
 * @param from 現在地
 * @param to 目標地点
 * @param stepDistance tick あたりの移動距離 (speed * tickMs)
 * @param minSteps 経路の最低 step 数
 */
export const generateMovePath = (
  from: Position,
  to: Position,
  stepDistance: number,
  minSteps = 1,
): MovePath => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) {
    return []
  }

  const naturalStepCount = Math.ceil(distance / stepDistance)

  if (naturalStepCount < minSteps) {
    return Array.from({ length: minSteps }, (_, index) => {
      const ratio = Math.min((index + 1) / minSteps, 1)

      return { x: from.x + dx * ratio, y: from.y + dy * ratio }
    })
  }

  const dirX = dx / distance
  const dirY = dy / distance

  return Array.from({ length: naturalStepCount }, (_, index) => {
    const isLastStep = index === naturalStepCount - 1

    if (isLastStep) {
      return { x: to.x, y: to.y }
    }

    const traveled = (index + 1) * stepDistance

    return { x: from.x + dirX * traveled, y: from.y + dirY * traveled }
  })
}
