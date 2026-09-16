import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { OBSTACLE_CELLS } from '../constants'

/** cell が障害物セルか判定する */
export const isObstacleCell = (cell: HexCell): boolean =>
  OBSTACLE_CELLS.some(
    (obstacle) => obstacle.q === cell.q && obstacle.r === cell.r,
  )
