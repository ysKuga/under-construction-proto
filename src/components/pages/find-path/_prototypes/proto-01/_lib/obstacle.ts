import { GridPosition } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

import { OBSTACLE_CELLS } from '../constants'

/** cell が障害物セルか判定する */
export const isObstacleCell = (cell: GridPosition): boolean =>
  OBSTACLE_CELLS.some(
    (obstacle) => obstacle.col === cell.col && obstacle.row === cell.row,
  )
