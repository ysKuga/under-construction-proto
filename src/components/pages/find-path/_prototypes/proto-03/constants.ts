import { HEX_DIRECTIONS, HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/** グリッド形状 */
export const GRID = { cols: 5, rows: 5 } as const

/** 六角形の外接円半径 (px) */
export const HEX_SIZE = 40

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
 * - `(1,1)`: 当初 `(0,1)` だったが、START `(0,0)` の隣接セルで実際に表示される
 *   のは障害物 `(1,0)` とこのマスのみ（座標変換の関係で他の隣接は画面外）だった
 *   ため、EN デバッグ操作で EN 切れを作ろうとしても必ず回復アイテムを踏んでしまい
 *   検証できなかった。START 隣接から外すため移動（issue-181-en）
 */
export const RECOVERY_ITEM_CELLS = [{ amount: 3, q: 1, r: 1 }] as const

/**
 * 回復スポット一覧（踏むたび回復、指定回数で枯渇しうる）
 *
 * - 配置・回復量・回数は仮値（issue-181-en design.md 懸念・リスク、後日バランス調整）
 */
export const RECOVERY_SPOT_CELLS = [
  { amount: 2, q: 0, r: 3, stock: 2 },
] as const

/**
 * 初期表示モード `partial` で霧（非表示対象）とするセル一覧
 *
 * - ゴールとその6近傍（仮の領域。issue #137）
 * - 霧セル以外は常時表示する
 */
export const PARTIAL_FOG_CELLS: readonly HexCell[] = [
  GOAL_POSITION,
  ...HEX_DIRECTIONS.map((direction) => ({
    q: GOAL_POSITION.q + direction.q,
    r: GOAL_POSITION.r + direction.r,
  })),
]
