import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/**
 * tick 1 回分の論理時間（ms）
 *
 * - 1 tick = bot 1 セルぶんの移動（隣接セルのみ選択可のため区間距離は常に 1）
 */
export const TICK_MS = 400

/**
 * auto 進行の実時間刻み（ms）
 *
 * - `timeScale` はこの刻み単位で反映される
 */
export const REALTIME_STEP_MS = 10

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
