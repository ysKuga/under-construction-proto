import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/** EN 切れ演出（予防姿勢）発火までの遅延（ms、演出上のタメ。proto-01 と同じ値） */
export const ENERGY_OUT_DELAY_MS = 300

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
