import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/** bot の初期セル（axial 原点） */
export const START_POSITION: HexCell = { q: 0, r: 0 }

/** ゴールセル */
export const GOAL_POSITION: HexCell = { q: 3, r: 2 }

/** 障害物セル一覧（通行不可） */
export const OBSTACLE_CELLS: readonly HexCell[] = [
  { q: 1, r: 0 },
  { q: 2, r: 1 },
  { q: 3, r: 0 },
]

/** 一方通行セル一覧（退出方向固定。exitDirection の逆方向からの進入を拒否） */
export const ONE_WAY_CELLS = [
  { exitDirection: 'right', q: 1, r: 3 },
  { exitDirection: 'lower-left', q: 4, r: 0 },
] as const
