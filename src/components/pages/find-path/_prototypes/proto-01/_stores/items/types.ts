import { StoreApi } from 'zustand/vanilla'

import { GridPosition } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

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
 * グリッド上のアイテムを保持する store
 */
export type ItemState = {
  /** id のアイテムを消費する（stock 未指定は削除、指定時は1減らす。枯渇済みは undefined） */
  consumeItem: (id: string) => ItemInstance | undefined
  /** cell 上の未消費アイテムを返す */
  getItemAtCell: (cell: GridPosition) => ItemInstance | undefined
  /** アイテム一覧 */
  itemsById: Record<string, ItemInstance>
  /** 初期状態に戻す */
  reset: () => void
}

export type ItemStore = StoreApi<ItemState>
