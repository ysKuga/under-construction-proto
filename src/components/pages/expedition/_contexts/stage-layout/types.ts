import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'

/** 一方通行セルの退出方向（axial の6近傍、`HEX_DIRECTIONS` と対応） */
export type OneWayDirection =
  'left' | 'lower-left' | 'lower-right' | 'right' | 'upper-left' | 'upper-right'

/** 一方通行セル（退出方向固定。exitDirection の逆方向からの進入を拒否） */
export type OneWayCell = HexCell & {
  /** 退出方向 */
  exitDirection: OneWayDirection
}

/** EN 補給アイテムの配置（踏むと携行、使用で補給、1個ずつ使い切り） */
export type ChargeItemCell = HexCell & {
  /** 補給量 */
  amount: number
}

/** EN スポットの配置（停止中に使用して補給、残量が尽きると枯渇する） */
export type ChargeSpotCell = HexCell & {
  /** 1 回の補給あたりの補給量 */
  amount: number
  /** 残りの補給回数 */
  stock: number
}

/**
 * ステージの盤面配置
 *
 * - マウント中は不変。差し替えは Provider の `key` 変更による再マウントで行う（issue #315）
 */
export type StageLayout = {
  /** ゴールセル */
  goal: HexCell
  /** EN 補給アイテム一覧 */
  items: readonly ChargeItemCell[]
  /** 障害物セル一覧（通行不可） */
  obstacles: readonly HexCell[]
  /** 一方通行セル一覧 */
  oneWays: readonly OneWayCell[]
  /** EN スポット一覧 */
  spots: readonly ChargeSpotCell[]
  /** bot の初期セル */
  start: HexCell
}
