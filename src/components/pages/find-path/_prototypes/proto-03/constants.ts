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

/**
 * 回復アイテム一覧（踏むと回復、1個ずつ使い切り）
 *
 * - 配置・回復量は仮値（issue-181-en design.md 懸念・リスク、後日バランス調整）
 */
export const RECOVERY_ITEM_CELLS = [{ amount: 3, q: 0, r: 1 }] as const

/**
 * 回復スポット一覧（踏むたび回復、指定回数で枯渇しうる）
 *
 * - 配置・回復量・回数は仮値（issue-181-en design.md 懸念・リスク、後日バランス調整）
 */
export const RECOVERY_SPOT_CELLS = [
  { amount: 2, q: 0, r: 3, stock: 2 },
] as const
