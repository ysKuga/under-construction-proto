import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'

import { StageLayout } from '../_contexts/stage-layout/types'

/**
 * cell が障害物セルか判定する
 *
 * @param cell 判定対象セル
 * @param stageLayout 盤面配置
 */
export const isObstacleCell = (
  cell: HexCell,
  stageLayout: Pick<StageLayout, 'obstacles'>,
): boolean =>
  stageLayout.obstacles.some(
    (obstacle) => obstacle.q === cell.q && obstacle.r === cell.r,
  )
