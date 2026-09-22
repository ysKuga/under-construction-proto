/**
 * tick 1 回分の論理時間（ms）
 *
 * - 1 tick = bot 1 セルぶんの移動。tc-03 の `getTickMs(tickRate)` に相当するが、
 *   find-path proto は actor store を持ち込まないため固定値にしている
 */
export const TICK_MS = 400

/**
 * auto 進行の実時間刻み（ms）
 *
 * - `timeScale` はこの刻み単位で反映される。tc-03 position store の
 *   `REALTIME_STEP_MS` と同値
 */
export const REALTIME_STEP_MS = 10

/** ゴールセル */
export const GOAL_POSITION = { col: 3, row: 3 } as const

/** 障害物セル一覧（通行不可） */
export const OBSTACLE_CELLS = [
  { col: 1, row: 1 },
  { col: 2, row: 2 },
  { col: 3, row: 1 },
] as const

/** 一方通行セル一覧（退出方向固定。exitDirection の逆方向からの進入を拒否） */
export const ONE_WAY_CELLS = [
  { col: 1, exitDirection: 'right', row: 3 },
  { col: 3, exitDirection: 'up', row: 2 },
] as const

/**
 * 回復アイテム一覧（踏むと回復、1個ずつ使い切り）
 *
 * - 配置・回復量は仮値（design.md 懸念・リスク、後日バランス調整）
 */
export const RECOVERY_ITEM_CELLS = [{ amount: 3, col: 2, row: 0 }] as const

/**
 * 回復スポット一覧（踏むたび回復、指定回数で枯渇しうる）
 *
 * - 配置・回復量・回数は仮値（design.md 懸念・リスク、後日バランス調整）
 */
export const RECOVERY_SPOT_CELLS = [
  { amount: 2, col: 4, row: 2, stock: 2 },
] as const

/**
 * 携行可能な回復アイテムの上限数
 *
 * - 仮値（design.md 懸念・リスク、後日バランス調整）
 */
export const CARRIED_ITEM_CAPACITY = 3
