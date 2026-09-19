import { StoreApi } from 'zustand/vanilla'

import { GridPosition } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

/**
 * セル上の要素（障害物 or アイテム）を統一的に表す
 *
 * - `PlannedPathLayer` の hover 説明表示（issue #137）向け。マス上の要素を種類を
 *   問わず横断的に取得するため、`getContentsAtCell` の戻り値として使う
 */
export type CellContent =
  { item: ItemInstance; kind: 'item' } | { kind: 'obstacle' }

/** グリッド上に配置されたアイテム1個の実体 */
export type ItemInstance = {
  /** 種類ごとの効果量 */
  amount: number
  /** 対象セル */
  cell: GridPosition
  /** アイテムID */
  id: string
  /** 種類 */
  kind: ItemKind
  /** 残り使用回数（未指定は1回限り、指定時は指定回数で枯渇しうる） */
  stock?: number
}

/**
 * アイテムの種類
 *
 * - 今後の拡張を見込み種類で判別する（issue #181 時点では energy-recovery のみ）
 */
export type ItemKind = 'energy-recovery'

/**
 * グリッド上のアイテム・障害物を保持する store
 *
 * - 障害物（`obstacleCells`）は静的で消費されない。アイテムとは責務が異なるが、
 *   「セル上に何があるか」を横断的に問い合わせる窓口（`getContentsAtCell`）を
 *   一本化するためここで束ねる（issue #137、PR #196 レビュー対応）
 */
export type ItemState = {
  /** id のアイテムを消費する（stock 未指定は削除、指定時は1減らす。枯渇済みは undefined） */
  consumeItem: (id: string) => ItemInstance | undefined
  /** cell 上の要素（障害物・アイテム）を種類問わず返す */
  getContentsAtCell: (cell: GridPosition) => CellContent[]
  /** cell 上の未消費アイテムを返す */
  getItemAtCell: (cell: GridPosition) => ItemInstance | undefined
  /** アイテム一覧 */
  itemsById: Record<string, ItemInstance>
  /** 障害物セル一覧（通行不可、静的） */
  obstacleCells: GridPosition[]
  /** 初期状態に戻す */
  reset: () => void
}

export type ItemStore = StoreApi<ItemState>
