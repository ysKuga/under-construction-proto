import { DEFAULT_ENERGY_INFO } from '@/components/pages/expedition/_stores/energy/constants'

import { GenerateStageParams } from '../../_lib/generate-stage'
import { CARRIED_ITEM_CAPACITY } from '../../_stores/carried-items/constants'
import { GRID } from '../../constants'

/**
 * seed から盤面を生成する際の条件
 *
 * - 要素の個数・補給量は `DEFAULT_STAGE_LAYOUT` と揃える
 * - EN の条件は各 store の既定値と揃える（移動あたりの消費量は `_stores/energy-settings` の既定値）
 */
export const GENERATE_STAGE_PARAMS: GenerateStageParams = {
  energy: {
    carryCapacity: CARRIED_ITEM_CAPACITY,
    consumePerMove: 1,
    ...DEFAULT_ENERGY_INFO,
  },
  grid: GRID,
  items: { amount: 3, count: 1 },
  maxAttempts: 100,
  maxRelocations: 5,
  minGoalDistance: 3,
  obstacleCount: 3,
  oneWayCount: 2,
  spots: { amount: 1, count: 1, stock: 4 },
}
