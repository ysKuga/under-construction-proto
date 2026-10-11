import { GenerateStageParams } from '../../_lib/generate-stage'
import { GRID } from '../../constants'

/**
 * seed から盤面を生成する際の条件
 *
 * - 要素の個数・補給量は `DEFAULT_STAGE_LAYOUT` と揃える
 */
export const GENERATE_STAGE_PARAMS: GenerateStageParams = {
  grid: GRID,
  items: { amount: 3, count: 1 },
  maxAttempts: 100,
  maxRelocations: 5,
  minGoalDistance: 3,
  obstacleCount: 3,
  oneWayCount: 2,
  spots: { amount: 1, count: 1, stock: 4 },
}
