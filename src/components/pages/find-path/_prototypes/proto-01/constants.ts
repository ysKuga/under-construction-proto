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
