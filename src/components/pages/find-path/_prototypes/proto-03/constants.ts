import { HEX_DIRECTIONS, HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/** グリッド形状 */
export const GRID = { cols: 5, rows: 5 } as const

/** 六角形の外接円半径 (px) */
export const HEX_SIZE = 40

/** bot の初期セル（axial 原点） */
export const START_POSITION: HexCell = { q: 0, r: 0 }

/**
 * 目標セルのオーバーレイアンカーを actors store へ登録する際の擬似 id
 *
 * - 目標セル側にも bot と同じ吹き出しを注入するため、actor 用の overlay anchor を流用する
 * - actor の id（`PLAYER_ACTOR_ID` 等）と重複しない値にする
 */
export const OBJECTIVE_OVERLAY_ID = 'objective'

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
 * EN 回復アイテム一覧（踏むと携行、使用で回復、1個ずつ使い切り）
 *
 * - 配置・回復量は仮値（issue-181-en design.md 懸念・リスク、後日バランス調整）
 * - `(1,1)`: 当初 `(0,1)` だったが、START `(0,0)` の隣接セルで実際に表示される
 *   のは障害物 `(1,0)` とこのマスのみ（座標変換の関係で他の隣接は画面外）だった
 *   ため、EN デバッグ操作で EN 切れを作ろうとしても必ず EN 回復アイテムを踏んでしまい
 *   検証できなかった。START 隣接から外すため移動（issue-181-en）
 */
export const RECOVERY_ITEM_CELLS = [{ amount: 3, q: 1, r: 1 }] as const

/**
 * EN スポット一覧（停止中に使用して回復、残量が尽きると枯渇する）
 *
 * - `amount` は 1 回復あたりの回復量、`stock` は残りの回復回数（issue #297）
 * - 配置・残量は仮値（issue-181-en design.md 懸念・リスク、後日バランス調整）
 */
export const RECOVERY_SPOT_CELLS = [
  { amount: 1, q: 0, r: 3, stock: 4 },
] as const

/** EN スポットでの 1 回復あたりの所要時間（ms。issue #297） */
export const ENERGY_SPOT_RECOVERY_INTERVAL_MS = 300

/** EN スポットでの回復の完了（「補給完了！」）を表示し続ける時間（ms。issue #297） */
export const ENERGY_SPOT_RECOVERED_NOTICE_MS = 1500

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
