import { StoreApi } from 'zustand/vanilla'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/**
 * セル上の要素（障害物 or アイテム）を統一的に表す
 *
 * - hover 説明表示（issue #137）向け。アイテム（この store）と障害物
 *   （`_lib/obstacle.ts`、静的定数のまま独立管理）は責務を分けたまま、
 *   `_lib/get-cell-contents.ts` の `getCellContents`（pure function）が両者を
 *   横断的に問い合わせて返す戻り値の型（proto-01 の同型を axial 座標へ移植）
 */
export type CellContent =
  { item: ItemInstance; kind: 'item' } | { kind: 'obstacle' }

/** グリッド上に配置されたアイテム1個の実体 */
export type ItemInstance = {
  /** 種類ごとの効果量 */
  amount: number
  /** 対象セル */
  cell: HexCell
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
  getItemAtCell: (cell: HexCell) => ItemInstance | undefined
  /** アイテム一覧 */
  itemsById: Record<string, ItemInstance>
  /** 初期状態に戻す */
  reset: () => void
}

export type ItemStore = StoreApi<ItemState>
